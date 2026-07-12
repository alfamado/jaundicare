// import { useEffect } from 'react';
// import NetInfo from '@react-native-community/netinfo';
// import { getOfflineQueue, removeSyncedItem } from '../services/offlineStore';
// import { API_BASE_URL } from '../services/api';

// export const useOfflineSync = () => {
//   useEffect(() => {
//     const unsubscribe = NetInfo.addEventListener(state => {
//       if (state.isConnected && state.isInternetReachable) {
//         attemptQueueFlush();
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   const attemptQueueFlush = async () => {
//     const queue = await getOfflineQueue();
//     if (queue.length === 0) return;

//     for (const item of queue) {
//       try {
//         const formData = new FormData();
//         formData.append('age_hours', item.ageHours.toString());
//         formData.append('feeding_status', item.feedingStatus);
//         formData.append('state', item.state);
//         formData.append('observed_signs', JSON.stringify(item.observedSigns));

//         // Package raw local system reference paths cleanly as File data bounds
//         formData.append('image', {
//           uri: item.localImageFilePath,
//           name: `sync_${item.id}.jpg`,
//           type: 'image/jpeg'
//         } as any);

//         const response = await fetch(`${API_BASE_URL}/api/v1/screening/process`, {
//           method: 'POST',
//           body: formData,
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         });

//         if (response.ok) {
//           await removeSyncedItem(item.id, item.localImageFilePath);
//           console.log(`[Sync Engine] Reconciled and updated local storage for record ${item.id}`);
//         }
//       } catch (err) {
//         console.error(`[Sync Engine] Outbox batch processing failed for item ${item.id}:`, err);
//         break; // Stop running remaining elements until network routes stabilize completely
//       }
//     }
//   };
// };






// /**
//  * JaundiCare — useOfflineSync Hook (Production-Hardened)
//  * Thread-safe background offline outbox reconciliation engine.
//  */

// /**
//  * JaundiCare — useOfflineSync Hook
//  */
// import { useEffect, useCallback, useRef } from 'react';
// import NetInfo from '@react-native-community/netinfo';

// // Ensure this uses named braces pointing to the correct relative directory path
// import { syncOfflineStore, getPendingCount } from '../services/offlineStore';

// export const useOfflineSync = () => {
//   const isSyncing = useRef(false);

//   const attemptQueueFlush = useCallback(async () => {
//     // Prevent overlapping sync iterations if NetInfo fires rapid execution events
//     if (isSyncing.current) return;
//     isSyncing.current = true;

//     try {
//       const queue = await getOfflineQueue();
//       if (!queue || queue.length === 0) {
//         isSyncing.current = false;
//         return;
//       }

//       console.log(`[Sync Engine] Found ${queue.length} pending records in outbox.`);

//       for (const item of queue) {
//         try {
//           const formData = new FormData();
          
//           // ── Production Win: Map variables to match apiPayload structures exactly ──
//           if (item.age_hours != null) {
//             formData.append('age_hours', String(item.age_hours));
//           }
//           formData.append('feeding', item.feeding);
          
//           // Map locations safely matching standard manual selectors
//           if (item.user_state) formData.append('state', item.user_state);
//           if (item.user_lga) formData.append('lga', item.user_lga);
//           formData.append('facility_preference', item.facility_preference || 'nearest');
//           formData.append('ui_language', item.ui_language || 'en');

//           // Map health tracking flags directly
//           formData.append('difficult_to_wake', String(item.difficult_to_wake ?? false));
//           formData.append('floppy_or_unusually_drowsy', String(item.floppy_or_unusually_drowsy ?? false));
//           formData.append('jaundice_first_24h', String(item.jaundice_first_24h ?? false));
//           formData.append('jaundice_spreading', String(item.jaundice_spreading ?? false));
//           formData.append('yellow_eyes', String(item.yellow_eyes ?? false));
//           formData.append('yellow_gums', String(item.yellow_gums ?? false));
//           formData.append('yellow_palms_or_soles', String(item.yellow_palms_or_soles ?? false));
//           formData.append('dark_urine', String(item.dark_urine ?? false));
//           formData.append('pale_stool', String(item.pale_stool ?? false));

//           // Package structural image references safely using actual input payload fields
//           if (item.imageUri) {
//             formData.append('image', {
//               uri: item.imageUri,
//               name: `sync_${item.id || Date.now()}.jpg`,
//               type: 'image/jpeg'
//             } as any);
//           }

//           // ── Production Win: Omit 'Content-Type' header ──
//           // Allows React Native's native fetch engine to automatically calculate form boundaries.
//           const response = await fetch(`${API_BASE_URL}/api/v1/screening/process`, {
//             method: 'POST',
//             body: formData,
//             headers: {
//               'Accept': 'application/json',
//             },
//           });

//           if (response.ok) {
//             // Clean up native storage traces to free device memory blocks
//             await removeSyncedItem(item.id);
//             console.log(`[Sync Engine] Successfully synchronized record: ${item.id}`);
//           } else {
//             console.warn(`[Sync Engine] Server rejected record ${item.id} with status: ${response.status}`);
//             // Break loop on server errors to prevent high battery/data usage cycles
//             break; 
//           }
//         } catch (itemErr) {
//           console.error(`[Sync Engine] Transport execution failed for item ${item.id}:`, itemErr);
//           break; // Stop remaining items until connection lines stabilize
//         }
//       }
//     } catch (globalErr) {
//       console.error("[Sync Engine] Outbox allocation critical failure:", globalErr);
//     } finally {
//       isSyncing.current = false;
//     }
//   }, []);

//   useEffect(() => {
//     const unsubscribe = NetInfo.addEventListener(state => {
//       if (state.isConnected && state.isInternetReachable) {
//         attemptQueueFlush();
//       }
//     });

//     return () => unsubscribe();
//   }, [attemptQueueFlush]);

//   return { forceSync: attemptQueueFlush };
// };




/**
 * JaundiCare — useOfflineSync Hook
 * Listens for active cellular network transitions and cleanly routes execution 
 * to the core transactional storage engine.
 */

import { useEffect, useCallback, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { syncOfflineStore, getPendingCount } from '../services/offlineStore';

export const useOfflineSync = () => {
  const isProcessing = useRef(false);

  const attemptQueueFlush = useCallback(async () => {
    if (isProcessing.current) return;
    
    try {
      const pendingCount = await getPendingCount();
      if (pendingCount === 0) return;

      isProcessing.current = true;
      console.log(`[useOfflineSync] Network online. Flushing outbox pipeline...`);
      
      await syncOfflineStore();
    } catch (err) {
      console.error("[useOfflineSync] Background queue synchronization failed:", err);
    } finally {
      isProcessing.current = false;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        attemptQueueFlush();
      }
    });

    return () => unsubscribe();
  }, [attemptQueueFlush]);

  return { forceSync: attemptQueueFlush };
};