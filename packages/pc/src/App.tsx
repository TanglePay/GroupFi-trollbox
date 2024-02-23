import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AppWrapper, Spinner } from 'components/Shared'
import { useEffect, createContext, useState, lazy } from 'react'
import { MqttClient } from '@iota/mqtt.js'
import { connect } from 'mqtt'
import { useMessageDomain } from 'groupfi_trollbox_shared'
import { LocalStorageAdaptor, classNames } from 'utils'
import { SWRConfig } from 'swr'

import { GroupInfo } from 'redux/types'
import { useAppDispatch, useAppSelector } from './redux/hooks'
import { setForMeGroups } from './redux/forMeGroupsSlice'
import { setMyGroups } from './redux/myGroupsSlice'
import { setUserProfile } from './redux/appConfigSlice'
import { UserNameCreation } from 'components/UserName'

import sdkInstance, { trollboxEventEmitter } from './sdk'

import './App.scss'

// Not check cash token and public key in development env
const isProd = import.meta.env.MODE !== 'development'

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
    path: 'group/:id/members',
    async lazy() {
      const Component = (await import('./components/GroupMemberList')).default
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
    path: 'group/:id/members',
    async lazy() {
      const Component = (await import('./components/GroupMemberList')).default
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

interface AddressInfo {
  address: string
  nodeId: number
}

function App() {
  const { messageDomain } = useMessageDomain()

  const [addressInfo, setAddressInfo] = useState<AddressInfo | undefined>(
    undefined
  )

  const [isTPInstalled, setIsTPInstalled] = useState<boolean | undefined>(
    undefined
  )

  useLoadForMeGroupsAndMyGroups(addressInfo?.address)

  const [hasEnoughCashToken, hasPublicKey] = useCheckCashTokenAndPublicKey(
    addressInfo?.address
  )

  const [mintProcessFinished, onMintFinish] = useCheckNicknameNft(
    addressInfo?.address
  )

  const isCheckPassed =
    isTPInstalled && hasEnoughCashToken && hasPublicKey && mintProcessFinished

  useEffect(() => {
    if (addressInfo !== undefined) {
      const { location } = router.state
      if (location.pathname !== '/') {
        router.navigate('/')
      }
      trollboxEventEmitter.walletConnectedChanged({
        walletConnectData: {
          walletType: 'TanglePay',
          ...addressInfo
        }
      })
    }
  }, [addressInfo])

  const fn = async () => {
    try {
      const adapter = new LocalStorageAdaptor()
      messageDomain.setStorageAdaptor(adapter)

      const { address, nodeId } = await messageDomain.connectWallet()
      setIsTPInstalled(true)

      await messageDomain.setupGroupFiMqttConnection(connect)

      messageDomain.listenningAccountChanged(({ address, nodeId }) => {
        setAddressInfo({ address, nodeId })
      })

      await messageDomain
        .getGroupFiService()
        .setupIotaMqttConnection(MqttClient)

      setAddressInfo({ address, nodeId })

      await messageDomain.bootstrap()
      await messageDomain.start()
      await messageDomain.resume()
    } catch (error: any) {
      console.log('init error', error)
      if (error.name === 'TanglePayUnintalled') {
        setIsTPInstalled(false)
        trollboxEventEmitter.walletConnectedChanged({
          disconnectReason: error.name
        })
      }
      if (error.name === 'TanglePayConnectFailed') {
        trollboxEventEmitter.walletConnectedChanged({
          disconnectReason: error.name
        })
      }
    }
  }

  const initSDK = () => {
    return sdkInstance.listenningMessage()
  }

  useEffect(() => {
    fn()

    const stopListenningDappMessage = initSDK()
    return stopListenningDappMessage
  }, [])

  return (
    <SWRConfig value={{}}>
      <AppInitedContext.Provider
        value={{
          inited: addressInfo !== undefined
        }}
      >
        <AppWrapper>
          {!isCheckPassed ? (
            renderCeckRenderWithDefaultWrapper(
              <CheckRender
                onMintFinish={onMintFinish}
                mintProcessFinished={mintProcessFinished}
                hasEnoughCashToken={hasEnoughCashToken}
                hasPublicKey={hasPublicKey}
                isTPInstalled={isTPInstalled}
              />
            )
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

function useCheckNicknameNft(
  address: string | undefined
): [boolean | undefined, () => void] {
  const { messageDomain } = useMessageDomain()
  const groupFiService = messageDomain.getGroupFiService()

  const appDispatch = useAppDispatch()

  const [mintProcessFinished, setMintProcessFinished] = useState<
    undefined | boolean
  >(undefined)

  const checkIfhasOneNicknameNft = async (address: string) => {
    if (groupFiService) {
      const res = await groupFiService.fetchAddressNames([address])
      if (res[address] !== undefined) {
        appDispatch(setUserProfile(res[address]))
        setMintProcessFinished(true)
        return
      }
      const hasUnclaimedNameNFT = await groupFiService.hasUnclaimedNameNFT()
      setMintProcessFinished(hasUnclaimedNameNFT)
    }
  }

  useEffect(() => {
    if (address !== undefined) {
      appDispatch(setUserProfile(undefined))
      setMintProcessFinished(undefined)
      checkIfhasOneNicknameNft(address)
    }
  }, [address])

  const onMintFinish = () => setMintProcessFinished(true)

  return [mintProcessFinished, onMintFinish]
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

function CheckRender(props: {
  hasEnoughCashToken: boolean | undefined
  hasPublicKey: boolean | undefined
  isTPInstalled: boolean | undefined
  mintProcessFinished: boolean | undefined
  onMintFinish: () => void
}) {
  const { messageDomain } = useMessageDomain()
  const groupFiService = messageDomain.getGroupFiService()
  const {
    hasEnoughCashToken,
    hasPublicKey,
    isTPInstalled,
    mintProcessFinished,
    onMintFinish
  } = props

  if (isTPInstalled === undefined) {
    return <Spinner />
  }

  if (!isTPInstalled) {
    return (
      <div className="font-medium">
        You should install
        <span className={classNames('text-sky-500')}> TanglePay</span> Frist
      </div>
    )
  }

  if (hasEnoughCashToken === undefined) {
    return <Spinner />
  }

  if (!hasEnoughCashToken) {
    return (
      <div className="font-medium">
        You should have at least
        <br />
        <span className={classNames('text-sky-500')}>10 SMR</span> in your
        account
      </div>
    )
  }

  if (mintProcessFinished === undefined) {
    return <Spinner />
  }

  if (!mintProcessFinished) {
    return (
      <UserNameCreation
        groupFiService={groupFiService}
        onMintFinish={onMintFinish}
      />
    )
  }

  if (hasPublicKey === undefined) {
    return <Spinner />
  }

  if (!hasPublicKey) {
    return (
      <>
        <Spinner />
        <div className={classNames('mt-1')}>Creating public key</div>
      </>
    )
  }

  return null
}

function renderCeckRenderWithDefaultWrapper(element: JSX.Element) {
  return (
    <div
      className={classNames(
        'w-full h-full flex flex-row items-center justify-center'
      )}
    >
      {element}
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
  }): Promise<GroupInfo[]> => {
    const forMeGroups = await messageDomain
      .getGroupFiService()
      .getRecommendGroups(params)

    let groups: GroupInfo[] = forMeGroups

    if (params.includes !== undefined) {
      const sortedForMeGroups: GroupInfo[] = []
      params.includes.map((groupName) => {
        const index = forMeGroups.findIndex(
          (group) => group.groupName === groupName
        )
        if (index > -1) {
          sortedForMeGroups.push(forMeGroups[index])
        }
      })
      groups = sortedForMeGroups
    }

    appDispatch(setForMeGroups(groups))
    return groups
  }

  const loadMyGroupList = async () => {
    console.log('===>Enter myGroups request')
    const myGroups = await messageDomain.getGroupFiService().getMyGroups()
    console.log('===>myGroups', myGroups)
    appDispatch(setMyGroups(myGroups))
  }

  useEffect(() => {
    if (address) {
      ;(async () => {
        const groups = await loadForMeGroupList({ includes, excludes })
        if (groups.length === 1) {
          router.navigate(`/group/${groups[0].groupId}?home=true`)
        }
      })()
    }
  }, [address, includes, excludes])

  useEffect(() => {
    if (address) {
      loadMyGroupList()
    }
  }, [address])
}

export default App
