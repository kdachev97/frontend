import Stripe from 'stripe'
import { AxiosResponse } from 'axios'
import { useSession } from 'next-auth/react'
import { useMutation } from '@tanstack/react-query'

import {
  CancelPaymentIntentInput,
  BankImportResult,
  CheckoutSessionInput,
  CheckoutSessionResponse,
  DonationBankInput,
  DonationInput,
  DonationResponse,
  StripePaymentInput,
  UpdatePaymentIntentInput,
  UserDonationInput,
} from 'gql/donations'
import { apiClient } from 'service/apiClient'
import { endpoints } from 'service/apiEndpoints'
import { authConfig } from 'service/restRequests'
import { UploadBankTransactionsFiles } from 'components/admin/bank-transactions-file/types'

export const createCheckoutSession = async (data: CheckoutSessionInput) => {
  return await apiClient.post<CheckoutSessionInput, AxiosResponse<CheckoutSessionResponse>>(
    endpoints.donation.createCheckoutSession.url,
    data,
  )
}

export function useCreatePaymentIntent() {
  //Create payment intent useing the react-query mutation
  const { data: session } = useSession()
  return useMutation({
    mutationKey: [endpoints.donation.createPaymentIntent.url],
    mutationFn: async (data: Stripe.PaymentIntentCreateParams) => {
      return await apiClient.post<
        Stripe.PaymentIntentCreateParams,
        AxiosResponse<Stripe.PaymentIntent>
      >(endpoints.donation.createPaymentIntent.url, data, authConfig(session?.accessToken))
    },
  })
}

export function useCreateStripePayment() {
  //Create payment intent useing the react-query mutation
  const { data: session } = useSession()
  return useMutation({
    mutationFn: async (data: StripePaymentInput) => {
      return await apiClient.post<StripePaymentInput, AxiosResponse<Stripe.PaymentIntent>>(
        endpoints.donation.createStripePayment.url,
        data,
        authConfig(session?.accessToken),
      )
    },
  })
}

export function useUpdatePaymentIntent() {
  //Create payment intent useing the react-query mutation
  const { data: session } = useSession()
  return useMutation({
    mutationFn: async ({ id, payload }: UpdatePaymentIntentInput) => {
      return await apiClient.post<
        Stripe.PaymentIntentUpdateParams,
        AxiosResponse<Stripe.PaymentIntent>
      >(endpoints.donation.updatePaymentIntent(id).url, payload, authConfig(session?.accessToken))
    },
  })
}

export function useCancelPaymentIntent() {
  //Create payment intent useing the react-query mutation
  const { data: session } = useSession()
  return useMutation({
    mutationFn: async ({ id, payload }: CancelPaymentIntentInput) => {
      return await apiClient.post<
        Stripe.PaymentIntentCancelParams,
        AxiosResponse<Stripe.PaymentIntent>
      >(endpoints.donation.cancelPaymentIntent(id).url, payload, authConfig(session?.accessToken))
    },
  })
}

export function useCreateDonation() {
  const { data: session } = useSession()
  return async (data: DonationInput) => {
    return await apiClient.post<DonationResponse, AxiosResponse<DonationResponse>>(
      endpoints.donation.createDonation.url,
      data,
      authConfig(session?.accessToken),
    )
  }
}

export function useCreateBankDonation() {
  // const { data: session } = useSession()
  return async (data: DonationBankInput) => {
    return await apiClient.post<DonationResponse, AxiosResponse<DonationResponse>>(
      endpoints.donation.createBankDonation.url,
      data,
    )
  }
}

export function useEditDonation(id: string) {
  const { data: session } = useSession()
  return async (data: UserDonationInput) => {
    return await apiClient.patch<DonationResponse, AxiosResponse<DonationResponse>>(
      endpoints.donation.editDonation(id).url,
      data,
      authConfig(session?.accessToken),
    )
  }
}

export function useDeleteDonation(ids: string[]) {
  const { data: session } = useSession()
  return async () => {
    return await apiClient.post<DonationResponse, AxiosResponse<DonationResponse>>(
      endpoints.donation.deleteDonation.url,
      ids,
      authConfig(session?.accessToken),
    )
  }
}

export const useUploadBankTransactionsFiles = () => {
  const { data: session } = useSession()
  return async ({
    files,
    types: filesType,
    bankTransactionsFileId,
  }: UploadBankTransactionsFiles) => {
    const formData = new FormData()
    files.forEach((file: File) => {
      formData.append('file', file)
    })
    filesType.forEach((fileType) => {
      formData.append('types', fileType.type)
    })
    return await apiClient.post<FormData, AxiosResponse<BankImportResult[]>>(
      endpoints.donation.uploadBankTransactionsFile(bankTransactionsFileId).url,
      formData,
      {
        headers: {
          ...authConfig(session?.accessToken).headers,
          'Content-Type': 'multipart/form-data',
        },
      },
    )
  }
}

export const useExportToExcel = () => {
  const { data: session } = useSession()
  return async () => {
    return await apiClient(endpoints.donation.exportToExcel.url, {
      ...authConfig(session?.accessToken),
      responseType: 'blob',
    })
  }
}
