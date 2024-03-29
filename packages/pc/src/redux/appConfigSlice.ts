import 'immer'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserProfileInfo } from 'groupfi_trollbox_shared'
import { WalletInfo } from './types'


export interface AppConfig {
  activeTab: string
  userProfile: UserProfileInfo | undefined
  walletInfo: WalletInfo | undefined
}

const SUPPORTED_WALLET_TYPE_LIST = ['tanglepay']

function getInitWalletInfo(): WalletInfo | undefined {
  const searchParams = new URLSearchParams(window.location.search)
  const walletType = searchParams.get('walletType')
  
  if (walletType && SUPPORTED_WALLET_TYPE_LIST.includes(walletType)){
    return {walletType}
  }

  return undefined
}

const initialState: AppConfig = {
  activeTab: 'forMe',
  userProfile: undefined,
  walletInfo: getInitWalletInfo()
}

export const appConfigSlice = createSlice({
  name: 'appConfig',
  initialState,
  reducers: {
    changeActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload
    },
    setUserProfile(state, action: PayloadAction<UserProfileInfo | undefined>) {
      state.userProfile = action.payload
    },
    setWalletInfo(state, action: PayloadAction<WalletInfo | undefined>) {
      state.walletInfo = action.payload
    }
  }
})

export const { changeActiveTab, setUserProfile, setWalletInfo } =
  appConfigSlice.actions

export default appConfigSlice.reducer
