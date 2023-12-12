import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AppWrapper, Spinner } from 'components/Shared'
import { useEffect, createContext, useState, useCallback } from 'react'
import { MqttClient } from '@iota/mqtt.js'
import { connect } from 'mqtt'
import { useMessageDomain } from 'groupfi_trollbox_shared'
import { LocalStorageAdaptor, classNames } from 'utils'
import { SWRConfig } from 'swr'

import { useAppDispatch, useAppSelector } from './redux/hooks'
import { setForMeGroups } from './redux/forMeGroupsSlice'
import { setMyGroups } from './redux/myGroupsSlice'

import { SDKReceiver, SDKHandler } from './sdk'

import './App.scss'
import './public/index'

const router = createBrowserRouter([
  {
    path: '/',
    async lazy() {
      const Component = (await import('./components/GroupList')).default
      return { Component }
    }
  },
  {
    path: 'group/:id',
    async lazy() {
      const Component = (await import('./components/ChatRoom')).default
      return { Component }
    }
  },
  {
    path: 'group/:id/info',
    async lazy() {
      const Component = (await import('./components/GroupInfo')).default
      return { Component }
    }
  },
  {
    path: 'user/:id',
    async lazy() {
      const Component = (await import('./components/UserInfo')).default
      return { Component }
    }
  }
])

export const AppInitedContext = createContext({
  inited: false
})

function App() {
  const { messageDomain } = useMessageDomain()

  const [address, setAddress] = useState<string | undefined>(undefined)

  const appDispatch = useAppDispatch()

  useLoadForMeGroupsAndMyGroups(address)

  const [hasEnoughCashToken, hasPublicKey] =
    useCheckCashTokenAndPublicKey(address)

  const fn = async () => {
    const addr = await messageDomain.connectWallet()
    await messageDomain.setupGroupFiMqttConnection(connect)
    const adapter = new LocalStorageAdaptor()
    messageDomain.setStorageAdaptor(adapter)

    messageDomain.listenningAccountChanged((newAddress: string) => {
      setAddress(newAddress)
    })
    await messageDomain.getGroupFiService().setupIotaMqttConnection(MqttClient)

    setAddress(addr)

    await messageDomain.bootstrap()
    await messageDomain.start()
    await messageDomain.resume()
  }

  const initSDK = () => {
    const sdkHandler = new SDKHandler(appDispatch)
    const sdkReceiver = new SDKReceiver(sdkHandler)
    return sdkReceiver.listenningMessage()
  }

  useEffect(() => {
    fn()

    const stopListenningSDKMessage = initSDK()
    return stopListenningSDKMessage
  }, [])

  return (
    <SWRConfig value={{}}>
      <AppInitedContext.Provider
        value={{
          inited: address !== undefined
        }}
      >
        <AppWrapper>
          {!hasEnoughCashToken || !hasPublicKey ? (
            <CashTokenAndPublicKeyCheckRender
              hasEnoughCashToken={hasEnoughCashToken}
              hasPublicKey={hasPublicKey}
            />
          ) : (
            <RouterProvider
              router={router}
              fallbackElement={<p>Loading...</p>}
            ></RouterProvider>
          )}
        </AppWrapper>
      </AppInitedContext.Provider>
    </SWRConfig>
  )
}

function useCheckCashTokenAndPublicKey(
  address: string | undefined
): [boolean | undefined, boolean | undefined] {
  const { messageDomain } = useMessageDomain()

  const [hasEnoughCashToken, setHasEnoughCashToken] = useState<
    boolean | undefined
  >(undefined)

  const [hasPublicKey, setHasPublicKey] = useState<boolean | undefined>(
    undefined
  )

  useEffect(() => {
    if (address !== undefined) {
      setHasEnoughCashToken(undefined)
      setHasPublicKey(undefined)
      const off1 = messageDomain.onHasEnoughCashTokenOnce(() => {
        setHasEnoughCashToken(true)
      })
      const off2 = messageDomain.onNotHasEnoughCashTokenOnce(() => {
        setHasEnoughCashToken(false)
      })
      const off3 = messageDomain.onAquiringPublicKeyOnce(() => {
        setHasPublicKey(false)
      })
      const off4 = messageDomain.onIsHasPublicKeyChangedOnce(() => {
        setHasPublicKey(true)
      })

      return () => {
        off1()
        off2()
        off3()
        off4()
      }
    }
  }, [address])

  return [hasEnoughCashToken, hasPublicKey]
}

function CashTokenAndPublicKeyCheckRender(props: {
  hasEnoughCashToken: boolean | undefined
  hasPublicKey: boolean | undefined
}) {
  const { hasEnoughCashToken, hasPublicKey } = props
  return (
    <div className={classNames('text-center mt-20')}>
      {hasEnoughCashToken === undefined ? (
        <>
          <Spinner />
          <div className={classNames('mt-1')}>Checking SMR token</div>
        </>
      ) : hasEnoughCashToken ? (
        hasPublicKey === undefined ? (
          <>
            <Spinner />
            <div className={classNames('mt-1')}>Checking public key</div>
          </>
        ) : !hasPublicKey ? (
          <>
            <Spinner />
            <div className={classNames('mt-1')}>Creating public key</div>
          </>
        ) : null
      ) : (
        <div>
          <div>You should have at least 10 SMR in your account.</div>
        </div>
      )}
    </div>
  )
}

function useLoadForMeGroupsAndMyGroups(address: string | undefined) {
  const includes = useAppSelector((state) => state.forMeGroups.includes)
  const excludes = useAppSelector((state) => state.forMeGroups.excludes)

  const { messageDomain } = useMessageDomain()
  const appDispatch = useAppDispatch()

  const loadForMeGroupList = async (params: {
    includes?: string[]
    excludes?: string[]
  }) => {
    const forMeGroups = await messageDomain
      .getGroupFiService()
      .getRecommendGroups(params)
    console.log('===>forMeGroups', forMeGroups)
    appDispatch(setForMeGroups(forMeGroups))
  }

  const loadMyGroupList = async () => {
    console.log('===>Enter myGroups request')
    const myGroups = await messageDomain.getGroupFiService().getMyGroups()
    console.log('===>myGroups', myGroups)
    appDispatch(setMyGroups(myGroups))
  }

  useEffect(() => {
    if (address) {
      loadForMeGroupList({ includes, excludes })
    }
  }, [address, includes, excludes])

  useEffect(() => {
    if (address) {
      loadMyGroupList()
    }
  }, [address])
}

export default App
