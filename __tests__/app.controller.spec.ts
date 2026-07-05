import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from '@app/app.controller'

/**
 * Testes unitários para AppController
 *
 * Cenários testados:
 * - GET / retorna mensagem, nome do serviço "passarela-backend" e timestamp ISO do momento da chamada
 */
describe('AppController', () => {
  let appController: AppController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController]
    }).compile()

    appController = app.get<AppController>(AppController)
  })

  describe('getInfo', () => {
    it('retorna mensagem, nome do serviço e timestamp ISO', () => {
      const before = Date.now()

      const info = appController.getInfo()

      expect(info.message).toBe('Servidor Passarela em execução')
      expect(info.service).toBe('passarela-backend')
      expect(new Date(info.timestamp).getTime()).toBeGreaterThanOrEqual(before)
      expect(new Date(info.timestamp).getTime()).toBeLessThanOrEqual(Date.now())
    })
  })
})
