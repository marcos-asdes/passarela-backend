import { IAuthenticatedUser } from '@auth/application/types'
import { UserRole } from '@auth/domain/types'
import { CurrentUser } from '@auth/interface/current-user.decorator'
import { JwtAuthGuard } from '@auth/interface/jwt-auth.guard'
import { Roles } from '@auth/interface/roles.decorator'
import { RolesGuard } from '@auth/interface/roles.guard'
import { RegisterInterestUseCase } from '@interest/application/register-interest.use-case'
import { RemoveInterestUseCase } from '@interest/application/remove-interest.use-case'
import { IInterestRepository, INTEREST_REPOSITORY } from '@interest/application/types'
import { AlreadyInterestedError } from '@interest/domain/already-interested.error'
import { InterestNotFoundError } from '@interest/domain/interest-not-found.error'
import { OfferUnavailableError } from '@interest/domain/offer-unavailable.error'
import { RegisterInterestResponseDto } from '@interest/interface/register-interest-response.dto'
import { RegisterInterestDto } from '@interest/interface/register-interest.dto'
import type { IMyInterestItem } from '@interest/interface/types'
import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  UseGuards
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger'

/** Endpoint de interest — shopper registra/remove interesse numa offer, decrementando/incrementando o estoque */
@ApiTags('interest')
@Controller('interest')
export class InterestController {
  constructor(
    private readonly registerInterestUseCase: RegisterInterestUseCase,
    private readonly removeInterestUseCase: RemoveInterestUseCase,
    @Inject(INTEREST_REPOSITORY) private readonly interestRepository: IInterestRepository
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Shopper)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Registra interest numa offer — só shopper, 1 por shopper/offer' })
  @ApiCreatedResponse({ type: RegisterInterestResponseDto })
  @ApiConflictResponse({ description: 'Já registrou interest nessa offer, ou ela está indisponível' })
  async register(
    @CurrentUser() user: IAuthenticatedUser,
    @Body() dto: RegisterInterestDto
  ): Promise<RegisterInterestResponseDto> {
    try {
      const interest = await this.registerInterestUseCase.execute({ offerId: dto.offerId, shopperId: user.id })
      const responseDto = new RegisterInterestResponseDto()
      responseDto.id = interest.id
      return responseDto
    } catch (error) {
      if (error instanceof AlreadyInterestedError || error instanceof OfferUnavailableError) {
        throw new ConflictException(error.message)
      }
      throw error
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Shopper)
  @ApiBearerAuth()
  @Get('mine')
  @ApiOperation({
    summary: 'Lista os interests do shopper autenticado — usado pelo frontend no carregamento da página'
  })
  @ApiOkResponse({ description: 'Array de { id, offerId }' })
  async listMine(@CurrentUser() user: IAuthenticatedUser): Promise<IMyInterestItem[]> {
    const interests = await this.interestRepository.findByShopperId(user.id)
    return interests.map((i) => ({ id: i.id, offerId: i.offerId }))
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Shopper)
  @ApiBearerAuth()
  @Delete(':offerId')
  @ApiOperation({ summary: 'Remove o interest do shopper nessa offer e devolve 1 unidade ao estoque' })
  @ApiNoContentResponse({ description: 'Interest removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Interest não encontrado para este shopper e offer' })
  async remove(@CurrentUser() user: IAuthenticatedUser, @Param('offerId') offerId: string): Promise<void> {
    try {
      await this.removeInterestUseCase.execute({ offerId, shopperId: user.id })
    } catch (error) {
      if (error instanceof InterestNotFoundError) throw new NotFoundException(error.message)
      throw error
    }
  }
}
