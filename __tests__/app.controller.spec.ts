import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from '@app/app.controller'

/**
 * Testes unitários para AppController
 *
 * Cenários testados:
 * - GET / retorna a mensagem "Hello World" e o nome do serviço "passarela-backend"
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
    it('retorna mensagem hello world e nome do serviço', () => {
      expect(appController.getInfo()).toEqual({
        message: 'Hello World',
        service: 'passarela-backend'
      })
    })
  })
})
