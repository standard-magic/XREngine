import assert from 'assert'
import _ from 'lodash'

import IPFSStorage from '../../media/storageprovider/ipfs.storage'
import { createDefaultStorageProvider, getStorageProvider } from '../../media/storageprovider/storageprovider'
import {
  cleanSceneDataCacheURLs,
  corsPath,
  parseSceneDataCacheURLs,
  sceneCorsPathIdentifier,
  sceneRelativePathIdentifier
} from './scene-parser'

describe('Scene Helper Functions', () => {
  describe('should replace cache domain', async () => {
    const storageProvider = await createDefaultStorageProvider()
    const mockValue = `abcdef2144536`
    const mockValue2 = `08723ikjbolicujhc0asc`

    const savedMockData = {
      value: `${sceneRelativePathIdentifier}/${mockValue}`,
      property: {
        nestedValue: `${sceneRelativePathIdentifier}/${mockValue2}`
      }
    }

    let parsedMockData = {
      value: `https://${storageProvider.cacheDomain}/projects/${mockValue}`,
      property: {
        nestedValue: `https://${storageProvider.cacheDomain}/projects/${mockValue2}`
      }
    }
    if (storageProvider instanceof IPFSStorage) {
      parsedMockData = {
        value: `https://${storageProvider.cacheDomain}/ipfs/${mockValue}`,
        property: {
          nestedValue: `https://${storageProvider.cacheDomain}/ipfs/${mockValue2}`
        }
      }
    }

    it('should parse saved data', async function () {
      const parsedData = await parseSceneDataCacheURLs(_.cloneDeep(savedMockData) as any, storageProvider)
      assert.deepStrictEqual(parsedMockData, parsedData)
    })

    it('should unparse parsed data', async function () {
      const unparsedData = await cleanSceneDataCacheURLs(_.cloneDeep(parsedMockData) as any, storageProvider)
      assert.deepStrictEqual(savedMockData, unparsedData)
    })
  })

  describe('should replace cors proxy', () => {
    const mockDomain = `https://mydomain.com/something`

    const savedMockData = {
      value: `${sceneCorsPathIdentifier}/${mockDomain}`
    }

    const parsedMockData = {
      value: `${corsPath}/${mockDomain}`
    }

    it('should parse saved data', async function () {
      const storageProvider = getStorageProvider()
      const parsedData = await parseSceneDataCacheURLs(_.cloneDeep(savedMockData) as any, storageProvider)
      assert.deepStrictEqual(parsedMockData, parsedData)
    })

    it('should unparse parsed data', async function () {
      const storageProvider = getStorageProvider()
      const unparsedData = await cleanSceneDataCacheURLs(_.cloneDeep(parsedMockData) as any, storageProvider)
      assert.deepStrictEqual(savedMockData, unparsedData)
    })
  })
})
