import axios, {AxiosInstance} from "axios"

export type AxiosFactory = (baseURL: string) => AxiosInstance

export const buildAxios: AxiosFactory = (baseURL: string) =>
	axios.create({baseURL})
