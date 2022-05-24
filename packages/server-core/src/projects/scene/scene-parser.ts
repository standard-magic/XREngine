import { PortalDetail } from '@xrengine/common/src/interfaces/PortalInterface'
import { SceneData } from '@xrengine/common/src/interfaces/SceneInterface'
import { isDev } from '@xrengine/common/src/utils/isDev'

import config from '../../appconfig'
import { StorageProviderInterface } from '../../media/storageprovider/storageprovider.interface'

export const sceneRelativePathIdentifier = '__$project$__'
export const sceneCorsPathIdentifier = '__$cors-proxy$__'
export const corsPath =
  isDev || process.env.VITE_LOCAL_BUILD
    ? `https://${config.server.hostname}:${config.server.corsServerPort}`
    : `https://${config.server.hostname}/cors-proxy`

export const parseSceneDataCacheURLs = async (
  sceneData: any,
  storageProvider: StorageProviderInterface,
  internal = false
) => {
  for (const [key, val] of Object.entries(sceneData)) {
    if (val && typeof val === 'object') {
      sceneData[key] = await parseSceneDataCacheURLs(val, storageProvider, internal)
    }
    if (typeof val === 'string') {
      if (val.includes(sceneRelativePathIdentifier)) {
        sceneData[key] = await storageProvider.getCachedAsset(
          val.replace(sceneRelativePathIdentifier, '/projects'),
          internal
        )
      } else if (val.startsWith(sceneCorsPathIdentifier)) {
        sceneData[key] = val.replace(sceneCorsPathIdentifier, corsPath)
      }
    }
  }
  return sceneData
}

export const cleanSceneDataCacheURLs = async (
  sceneData: any,
  storageProvider: StorageProviderInterface,
  internal = false
) => {
  for (const [key, val] of Object.entries(sceneData)) {
    if (val && typeof val === 'object') {
      sceneData[key] = await cleanSceneDataCacheURLs(val, storageProvider, internal)
    }
    if (typeof val === 'string') {
      let host = storageProvider.cacheDomain
      if (val.includes(host)) {
        if (val.startsWith('https://')) host = 'https://' + host
        else host = 'http://' + host

        if (val.includes('/projects')) host += '/projects'

        sceneData[key] = val.replace(host, sceneRelativePathIdentifier)
      } else if (val.startsWith(corsPath)) {
        sceneData[key] = val.replace(corsPath, sceneCorsPathIdentifier)
      }
    }
  }
  return sceneData
}

export const parseScenePortals = (scene: SceneData) => {
  const portals: PortalDetail[] = []
  for (const [entityId, entity] of Object.entries(scene.scene?.entities!)) {
    for (const component of entity.components)
      if (component.name === 'portal') {
        portals.push({
          sceneName: scene.name,
          portalEntityId: entityId,
          spawnPosition: component.props.spawnPosition,
          spawnRotation: component.props.spawnRotation
        })
      }
  }
  return portals
}
