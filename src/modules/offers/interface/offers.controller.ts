import { IAuthenticatedUser } from '@auth/application/types'
import { UserRole } from '@auth/domain/types'
import { CurrentUser } from '@auth/interface/current-user.decorator'
import { JwtAuthGuard } from '@auth/interface/jwt-auth.guard'
import { Roles } from '@auth/interface/roles.decorator'
import { RolesGuard } from '@auth/interface/roles.guard'
import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CloseOfferUseCase } from '@offers/application/close-offer.use-case'
import { CreateOfferUseCase } from '@offers/application/create-offer.use-case'
import { ListMerchantOffersUseCase } from '@offers/application/list-merchant-offers.use-case'
import { ListPublicFeedUseCase } from '@offers/application/list-public-feed.use-case'
import { UpdateOfferUseCase } from '@offers/application/update-offer.use-case'
import { OfferAlreadyClosedError } from '@offers/domain/offer-already-closed.error'
import { OfferNotFoundError } from '@offers/domain/offer-not-found.error'
import { OfferNotOwnedError } from '@offers/domain/offer-not-owned.error'
import { CreateOfferDto } from '@offers/interface/create-offer.dto'
import { MerchantOfferResponseDto } from '@offers/interface/merchant-offer-response.dto'
import { OfferResponseDto } from '@offers/interface/offer-response.dto'
import { OffersGateway } from '@offers/interface/offers.gateway'
import { UpdateOfferDto } from '@offers/interface/update-offer.dto'

/** Endpoints de offers — criação/edição/encerramento pelo merchant, listagem pública pro shopper */
@ApiTags('offers')
@Controller('offers')
export class OffersController {
  constructor(
    private readonly createOfferUseCase: CreateOfferUseCase,
    private readonly updateOfferUseCase: UpdateOfferUseCase,
    private readonly closeOfferUseCase: CloseOfferUseCase,
    private readonly listMerchantOffersUseCase: ListMerchantOffersUseCase,
    private readonly listPublicFeedUseCase: ListPublicFeedUseCase,
    private readonly offersGateway: OffersGateway
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Merchant)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Publica uma nova offer — só merchant' })
  @ApiOkResponse({ type: OfferResponseDto })
  async create(@CurrentUser() user: IAuthenticatedUser, @Body() dto: CreateOfferDto): Promise<OfferResponseDto> {
    const offer = await this.createOfferUseCase.execute({ merchantId: user.id, ...dto })
    const responseDto = OfferResponseDto.fromEntity(offer)
    this.offersGateway.notifyOfferCreated(responseDto)
    return responseDto
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Merchant)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Edita uma offer própria — só enquanto ela estiver Active' })
  @ApiOkResponse({ type: OfferResponseDto })
  async update(
    @CurrentUser() user: IAuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateOfferDto
  ): Promise<OfferResponseDto> {
    try {
      const offer = await this.updateOfferUseCase.execute({ id, merchantId: user.id, data: dto })
      return OfferResponseDto.fromEntity(offer)
    } catch (error) {
      throw this.mapDomainError(error)
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Merchant)
  @ApiBearerAuth()
  @Post(':id/close')
  @ApiOperation({ summary: 'Encerra manualmente uma offer própria' })
  @ApiOkResponse({ type: OfferResponseDto })
  async close(@CurrentUser() user: IAuthenticatedUser, @Param('id') id: string): Promise<OfferResponseDto> {
    try {
      const offer = await this.closeOfferUseCase.execute({ id, merchantId: user.id })
      return OfferResponseDto.fromEntity(offer)
    } catch (error) {
      throw this.mapDomainError(error)
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Merchant)
  @ApiBearerAuth()
  @Get('mine')
  @ApiOperation({ summary: 'Dashboard do merchant — suas offers com a contagem de interest de cada uma' })
  @ApiOkResponse({ type: [MerchantOfferResponseDto] })
  async findMine(@CurrentUser() user: IAuthenticatedUser): Promise<MerchantOfferResponseDto[]> {
    const results = await this.listMerchantOffersUseCase.execute(user.id)
    return results.map((result) => MerchantOfferResponseDto.fromResult(result))
  }

  @Get()
  @ApiOperation({ summary: 'Feed público de offers — Active primeiro, depois Expired, depois SoldOut' })
  @ApiOkResponse({ type: [OfferResponseDto] })
  async findPublic(): Promise<OfferResponseDto[]> {
    const offers = await this.listPublicFeedUseCase.execute()
    return offers.map((offer) => OfferResponseDto.fromEntity(offer))
  }

  private mapDomainError(error: unknown): Error {
    if (error instanceof OfferNotFoundError) {
      return new NotFoundException()
    }
    if (error instanceof OfferNotOwnedError) {
      return new ForbiddenException()
    }
    if (error instanceof OfferAlreadyClosedError) {
      return new ConflictException()
    }
    return error instanceof Error ? error : new Error(String(error))
  }
}
