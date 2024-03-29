import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { classNames, addressToUserName } from 'utils'
import QuestionSVG from 'public/icons/question.svg'
import ArrowRightSVG from 'public/icons/arrrow-right.svg'
import ViewMemberSVG from 'public/icons/view-member.svg'
import MuteBigSVG from 'public/icons/mute-big.svg'
import MuteWhiteSVG from 'public/icons/mute-white.svg'
import {
  ContainerWrapper,
  HeaderWrapper,
  ContentWrapper,
  ReturnIcon,
  GroupTitle,
  Modal,
  GroupFiServiceWrapper,
  usePopoverMouseEvent,
  GeneralTooltip
} from '../Shared'
import {
  GroupFiService,
  UserProfileInfo,
  useMessageDomain
} from 'groupfi_trollbox_shared'
import { useEffect, useState } from 'react'
import { Loading, AsyncActionWrapper } from 'components/Shared'
import { addressToPngSrc } from 'utils'
import {
  useGroupMembers,
  useGroupIsPublic,
  getGroupIsPublicSwrKey,
  useOneBatchUserProfile
} from 'hooks'
import { useSWRConfig } from 'swr'

import { useAppDispatch } from 'redux/hooks'
import { removeGroup } from 'redux/myGroupsSlice'

const maxShowMemberNumber = 15

function GroupInfo(props: { groupId: string; groupFiService: GroupFiService }) {
  const { groupId, groupFiService } = props

  const currentAddress = groupFiService.getCurrentAddress()

  const { memberAddresses, isLoading } = useGroupMembers(groupId)

  const { userProfileMap } = useOneBatchUserProfile(memberAddresses ?? [])
  console.log('====>userProfileMap', userProfileMap)

  const [mutedAddress, setMutedAddress] = useState<string[]>([])

  const mutedMembers = async () => {
    const addressHashRes = await groupFiService.getGroupMuteMembers(groupId)
    console.log('***mutedMembers', addressHashRes)
    setMutedAddress(addressHashRes)
  }

  const refreshMutedMembers = useCallback(
    (memberAddress: string) => {
      const memberAddressHash = groupFiService.sha256Hash(memberAddress)
      setMutedAddress((s) =>
        s.includes(memberAddressHash)
          ? s.filter((i) => i !== memberAddressHash)
          : [...s, memberAddressHash]
      )
    },
    [mutedMembers]
  )

  useEffect(() => {
    mutedMembers()
  }, [])

  const isGroupMember =
    (memberAddresses ?? []).find((address) => address === currentAddress) !==
    undefined

  if (isLoading) {
    return <Loading />
  }

  return (
    <ContainerWrapper>
      <HeaderWrapper>
        <ReturnIcon />
        <GroupTitle
          showGroupPrivateIcon={false}
          title={`Group (${(memberAddresses ?? []).length})`}
        />
      </HeaderWrapper>
      <ContentWrapper>
        {memberAddresses !== undefined && memberAddresses.length > 0 && (
          <div
            className={classNames(
              'grid grid-cols-[repeat(5,1fr)] gap-x-3.5 gap-y-2 px-15px pt-5 pb-3'
            )}
          >
            {(memberAddresses.length > maxShowMemberNumber
              ? memberAddresses.slice(0, maxShowMemberNumber)
              : memberAddresses
            ).map((memberAddress, index) => (
              <Member
                groupId={groupId}
                isGroupMember={isGroupMember}
                avatar={addressToPngSrc(
                  groupFiService.sha256Hash,
                  memberAddress
                )}
                userProfile={userProfileMap?.[memberAddress]}
                muted={mutedAddress.includes(
                  groupFiService.sha256Hash(memberAddress)
                )}
                groupFiService={groupFiService}
                address={memberAddress}
                key={memberAddress}
                isLastOne={(index + 1) % 5 === 0}
                name={addressToUserName(memberAddress)}
                currentAddress={currentAddress}
                refresh={refreshMutedMembers}
              />
            ))}
          </div>
        )}
        {(memberAddresses ?? []).length > maxShowMemberNumber && (
          <ViewMoreMembers groupId={groupId} />
        )}
        <div className={classNames('mx-5 border-t border-black/10 py-4')}>
          <GroupStatus
            isGroupMember={isGroupMember}
            groupId={groupId}
            groupFiService={groupFiService}
          />
        </div>
        {isGroupMember && (
          <div className={classNames('mx-5 border-t border-black/10 py-4')}>
            <ReputationInGroup
              groupId={groupId}
              groupFiService={groupFiService}
            />
          </div>
        )}
        <LeaveOrUnMark
          groupId={groupId}
          isGroupMember={isGroupMember}
          groupFiService={groupFiService}
        />
      </ContentWrapper>
    </ContainerWrapper>
  )
}

export function Member(props: {
  avatar: string
  muted: boolean
  isLastOne: boolean
  name: string
  address: string
  isGroupMember: boolean
  currentAddress: string | undefined
  groupId: string
  refresh: (address: string) => void
  groupFiService: GroupFiService
  userProfile?: UserProfileInfo
}) {
  const {
    avatar,
    address,
    isLastOne,
    currentAddress,
    isGroupMember,
    muted,
    name,
    groupId,
    refresh,
    groupFiService,
    userProfile
  } = props
  const navigate = useNavigate()
  const [menuShow, setMenuShow] = useState(false)

  return (
    <div
      className={classNames('relative')}
      onMouseLeave={() => {
        if (menuShow) {
          setMenuShow(false)
        }
      }}
    >
      <div className={classNames('w-14 cursor-pointer')}>
        <div className={classNames('relative')}>
          <img
            onClick={() => {
              setMenuShow((s) => !s)
            }}
            className={classNames('rounded-lg w-full h-14')}
            src={avatar}
          />
          {muted && (
            <img
              className={classNames('absolute right-0 bottom-0')}
              src={MuteWhiteSVG}
            />
          )}
        </div>
        <p
          className={classNames('text-xs opacity-50 text-center mt-1 truncate')}
        >
          {userProfile?.name ?? name}
        </p>
      </div>
      <div
        className={classNames(
          'absolute left-0 min-w-[88px] top-[50px] z-10 mt-2 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
          menuShow ? 'block' : 'hidden',
          isLastOne ? 'left-[-16px]' : 'left-0'
        )}
      >
        {[
          {
            text: 'View',
            onClick: () => {
              navigate(`/user/${address}`)
            },
            icon: ViewMemberSVG,
            async: false
          },
          ...(isGroupMember && address !== currentAddress
            ? [
                {
                  text: muted ? 'UNMUTE' : 'Mute',
                  onClick: async () => {
                    if (muted) {
                      console.log('***unmute group member start')
                      await groupFiService.unMuteGroupMember(groupId, address)
                      console.log('***unmute group member end')
                    } else {
                      console.log(
                        '***mute group member start',
                        groupId,
                        address
                      )
                      await groupFiService.muteGroupMember(groupId, address)
                      console.log('***mute group member end')
                    }
                  },
                  icon: MuteBigSVG
                }
              ]
            : [])
        ].map(({ text, onClick, icon, async }, index) => (
          <AsyncActionWrapper
            onClick={onClick}
            async={async}
            key={index}
            onCallback={() => refresh(address)}
          >
            <div
              className={classNames(
                'text-sm py-3.5 px-3 cursor-pointer relative'
              )}
            >
              <img
                src={icon}
                className={classNames('h-[18px] absolute top-4')}
              />
              <span className={classNames('pl-7 font-medium')}>{text}</span>
            </div>
          </AsyncActionWrapper>
        ))}
      </div>
    </div>
  )
}

function ViewMoreMembers(props: { groupId: string }) {
  const { groupId } = props
  return (
    <div className={classNames('text-center mb-5')}>
      <Link to={`/group/${groupId}/members`}>
        <span
          className={classNames(
            'inline-flex flex-row justify-center items-center text-sm text-black/50 cursor-pointer'
          )}
        >
          View More Members
          <img src={ArrowRightSVG} className={classNames('ml-1 mt-px')} />
        </span>
      </Link>
    </div>
  )
}

function GroupStatus(props: {
  isGroupMember: boolean
  groupId: string
  groupFiService: GroupFiService
}) {
  const { groupId, groupFiService } = props
  const { mutate } = useSWRConfig()

  const { isPublic, isLoading, isValidating } = useGroupIsPublic(groupId)

  const refetch = () => {
    mutate(getGroupIsPublicSwrKey(groupId))
  }

  return (
    <div className={classNames('flex flex-row')}>
      <div className={classNames('flex-1')}>Group Status</div>
      <div className={classNames('flex-none')}>
        {isLoading ? 'loading...' : isPublic ? 'Public' : 'Private'}
      </div>
      {props.isGroupMember && (
        <Vote
          groupId={groupId}
          refresh={refetch}
          groupFiService={groupFiService}
        />
      )}
    </div>
  )
}

function Vote(props: {
  groupId: string
  refresh: () => void
  groupFiService: GroupFiService
}) {
  const { groupId, refresh, groupFiService } = props

  const [votesCount, setVotesCount] = useState<{
    0: number
    1: number
  }>()

  const [voteRes, setVoteRes] = useState<0 | 1>()

  const [menuShow, setMenuShow] = useState(false)

  const [onMouseEnter, onMouseLeave] = usePopoverMouseEvent(
    menuShow,
    () => setMenuShow(true),
    () => setMenuShow(false)
  )

  const getVoteResAndvotesCount = async () => {
    const groupVotesCount = await groupFiService.loadGroupVotesCount(groupId)
    console.log('***groupVotesCount', groupVotesCount)
    const voteRes = (await groupFiService.getGroupVoteRes(groupId)) as
      | 0
      | 1
      | undefined
    console.log('***voteRes', voteRes)
    setVotesCount({
      0: groupVotesCount.publicCount,
      1: groupVotesCount.privateCount
    })
    setVoteRes(voteRes)
  }

  useEffect(() => {
    getVoteResAndvotesCount()
  }, [])

  const onVote = async (vote: 0 | 1) => {
    try {
      let res:
        | {
            outputId: string
          }
        | undefined = undefined
      if (voteRes === vote) {
        console.log('$$$unvote start')
        // unvote
        res = await groupFiService.voteOrUnVoteGroup(groupId, undefined)
        setVotesCount((s) => {
          if (s === undefined) {
            return s
          }
          return {
            ...s,
            [vote]: s[vote] - 1
          }
        })
        setVoteRes(undefined)
        console.log('$$$unvote end')
      } else {
        console.log('$$$vote start:', vote)
        // vote
        res = await groupFiService.voteOrUnVoteGroup(groupId, vote)
        setVotesCount((s) => {
          if (s === undefined) {
            return s
          }
          if (voteRes === undefined) {
            return {
              ...s,
              [vote]: s[vote] + 1
            }
          } else {
            return {
              ...s,
              [voteRes]: s[voteRes] - 1,
              [vote]: s[vote] + 1
            }
          }
        })
        setVoteRes(vote)
        console.log('$$$vote end:', vote)
      }
      if (res !== undefined) {
        groupFiService.waitOutput(res.outputId).then(() => {
          if (refresh) {
            refresh()
          }
        })
      }
      console.log('***res', res)
    } catch (error) {
      console.log('***onVote Error', error)
    }
  }

  return (
    <div className="relative">
      <div>
        <div
          className={classNames('flex-none ml-4 text-primary cursor-pointer')}
          onMouseOver={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          VOTE
        </div>
      </div>
      <div
        className={classNames(
          'absolute right-0 w-24 z-10 mt-2 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
          menuShow ? 'block' : 'hidden'
        )}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {[
          {
            text: 'Public',
            value: 0,
            number: votesCount?.['0'] ?? ''
          },
          {
            text: 'Private',
            value: 1,
            number: votesCount?.['1'] ?? ''
          }
        ].map(({ text, number, value }) => (
          <AsyncActionWrapper
            key={value}
            onClick={() => {
              return onVote(value as 0 | 1)
            }}
          >
            <div
              className={classNames(
                'text-sm py-3.5 px-3 flex cursor-pointer',
                voteRes === value ? 'text-[#3671EE]' : 'text-[#333]'
              )}
            >
              {text}
              <span
                className={classNames(
                  'w-[18px] h-[18px] text-center ml-[auto] font-medium'
                )}
              >
                {number}
              </span>
            </div>
          </AsyncActionWrapper>
        ))}
      </div>
    </div>
  )
}

function ReputationInGroup(props: {
  groupId: string
  groupFiService: GroupFiService
}) {
  const { groupId, groupFiService } = props
  const [reputation, setReputation] = useState<number>()

  const getReputation = async () => {
    try {
      const res = await groupFiService.getUserGroupReputation(groupId)
      console.log('****Get Reputation', res)
      setReputation(res.reputation)
    } catch (error) {
      console.log('****Get Reputation error', error)
    }
  }

  useEffect(() => {
    getReputation()
  }, [])

  return (
    <div className={classNames('flex flex-row')}>
      <div className={classNames('flex-1')}>
        <span className={classNames('mr-2')}>My Reputation in Group</span>
        <GeneralTooltip
          message="Spamming results in blocks and reputation loss, leading to group removal. Maximum score is 100."
          toolTipContentWidth={160}
          width={20}
          height={20}
        >
          <img
            src={QuestionSVG}
            className={classNames('inline-block align-sub cursor-pointer')}
          />
        </GeneralTooltip>
      </div>
      <div className={classNames('flex-none ml-4 font-medium')}>
        {reputation ?? ''}
      </div>
    </div>
  )
}

function LeaveOrUnMark(props: {
  groupId: string
  isGroupMember: boolean
  groupFiService: GroupFiService
}) {
  const { messageDomain } = useMessageDomain()
  const { groupId, isGroupMember, groupFiService } = props

  const appDispatch = useAppDispatch()
  const navigate = useNavigate()

  const [modalShow, setModalShow] = useState(false)

  const [marked, setMarked] = useState<boolean | undefined>(undefined)

  const getGroupMarked = async () => {
    console.log('***getGroupMarked start')
    const res = await groupFiService.getGroupMarked(groupId)
    console.log('***getGroupMarked end', res)
    setMarked(res)
  }

  useEffect(() => {
    getGroupMarked()
  }, [])

  const hide = () => {
    setModalShow(false)
  }

  const onLeave = async () => {
    if (isGroupMember) {
      await messageDomain.leaveGroup(groupId)
    } else {
      await groupFiService.leaveOrUnMarkGroup(groupId)
    }

    appDispatch(removeGroup(groupId))
    navigate('/')
  }

  if (marked === undefined) {
    return null
  }

  if (marked === false && !isGroupMember) {
    return null
  }

  const text = isGroupMember
    ? { verb: 'Leave', verbing: 'Leaving' }
    : marked
    ? { verb: 'Unsubscribe', verbing: 'Unsubscribing' }
    : undefined

  return (
    <>
      <div
        className={classNames(
          'absolute left-0 bottom-0 w-full px-5 text-center'
        )}
      >
        <div
          className={classNames(
            'border-t border-black/10 pt-4 pb-5 text-[#D53554] text-sm cursor-pointer'
          )}
          onClick={() => {
            setModalShow((s) => !s)
          }}
        >
          {text?.verb}
        </div>
      </div>
      <Modal show={modalShow} hide={hide}>
        <LeaveOrUnMarkDialog
          hide={hide}
          groupId={groupId}
          text={text}
          onLeave={onLeave}
          groupFiService={groupFiService}
        />
      </Modal>
    </>
  )
}

function LeaveOrUnMarkDialog(props: {
  hide: () => void
  groupId: string
  onLeave: () => Promise<void>
  groupFiService: GroupFiService
  text:
    | {
        verb: string
        verbing: string
      }
    | undefined
}) {
  const { hide, groupId, text, onLeave, groupFiService } = props

  const [loading, setLoading] = useState(false)

  return (
    <div className={classNames('w-[334px] bg-white rounded-2xl p-4')}>
      <div className={classNames('text-center font-medium')}>
        {text?.verbing} Group Chat “{groupFiService.groupIdToGroupName(groupId)}
        ”
      </div>
      <div className={classNames('mt-4 flex font-medium justify-between')}>
        {[
          {
            text: 'Cancel',
            onClick: () => {
              hide()
            },
            className: 'bg-[#F2F2F7]'
          },
          {
            text: loading ? 'Loading...' : text?.verb,
            onClick: async () => {
              try {
                setLoading(true)
                await onLeave()
                console.log('***Leave group')
              } catch (error) {
                console.log('***Leave group error', error)
              } finally {
                setLoading(false)
                hide()
              }
            },
            className: 'bg-[#D53554] text-white'
          }
        ].map(({ text, onClick, className }, index) => (
          <button
            key={index}
            className={classNames(
              'w-[143px] text-center py-3 rounded-[10px]',
              className
            )}
            onClick={() => {
              if (loading) {
                return
              }
              onClick()
            }}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}

export default () => (
  <GroupFiServiceWrapper<{
    groupFiService: GroupFiService
    groupId: string
  }>
    component={GroupInfo}
    paramsMap={{ id: 'groupId' }}
  />
)
