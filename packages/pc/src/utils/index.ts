import { StorageAdaptor } from 'groupfi_trollbox_shared'
import ImagesMap from '../public/index'

// implement StorageAdaptor
export class LocalStorageAdaptor implements StorageAdaptor {
  async get(key: string): Promise<string | null> {
    return localStorage.getItem(key)
  }
  async set(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value)
  }
  async remove(key: string): Promise<void> {
    localStorage.removeItem(key)
  }
}

export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(' ')
}

export function addressToPngSrc(sha256Func: any, addr: string) {
  const pngNum = Number('0x' + sha256Func(addr)) % 118
  const pngNumStr = pngNum.toString().padStart(2, '0')
  return ImagesMap[pngNumStr]
}

export function addressToUserName(address: string) {
  return address.slice(0, 3) + '...' + address.slice(address.length - 4)
}

export function timestampFormater(second: number | undefined, hour12 = false) {
  if (second === undefined) {
    return undefined
  }
  const date = new Date(second * 1000)
  return new Intl.DateTimeFormat('default', {
    hour12,
    hour: 'numeric',
    minute: 'numeric'
  }).format(date)
}

export function removeHexPrefixIfExist(stringMaybeWithHexPrefix: string) {
  if (stringMaybeWithHexPrefix.startsWith('0x')) {
    return stringMaybeWithHexPrefix.slice(2)
  }
  return stringMaybeWithHexPrefix
}

export class ScrollDebounce {
  scrollTopThreshold = 1500
  updating = false
  lastScrollTop = 0
  delayMs = 200
  timer: NodeJS.Timeout | undefined = undefined
  // false: no more data to updage
  updateData: () => Promise<void>
  shouldStopUpdate = false

  constructor(updateData: () => Promise<void>) {
    this.updateData = updateData
  }

  async trigger(scrollTop: number) {
    if (this.lastScrollTop === 0 || scrollTop < this.lastScrollTop) {
      // Down operation

      if (scrollTop <= this.scrollTopThreshold && !this.updating) {
        this.updating = true
        try {
          await this.updateData()
        } finally {
          this.updating = false
        }
      }
    }
    this.lastScrollTop = scrollTop
  }

  onScroll(scrollTop: number) {
    if (this.shouldStopUpdate) {
      return
    }
    if (this.timer === undefined) {
      this.trigger(scrollTop)
    } else {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(
      function (this: ScrollDebounce) {
        this.trigger(scrollTop)
        this.timer = undefined
      }.bind(this),
      this.delayMs
    )
  }
}
