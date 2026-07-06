/** Corpo de resposta de POST /interest — só confirmação, o feed já reflete o estoque via GET /offers */
export interface IRegisterInterestResponse {
  id: string
}

/** Um item da lista GET /interest/mine — só o necessário pro frontend mapear offerId → interestId */
export interface IMyInterestItem {
  id: string
  offerId: string
}
