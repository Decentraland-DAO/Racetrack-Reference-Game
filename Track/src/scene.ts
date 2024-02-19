import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { PhysicsManager } from "@vegascity/racetrack/src/physics"
import { InputManager, Lap, TrackManager } from "@vegascity/racetrack/src/racetrack"
import { setup } from "@vegascity/racetrack/src/utils"
import { movePlayerTo, triggerSceneEmote } from "~system/RestrictedActions"
import { Minimap } from "@vegascity/racetrack/src/ui"
import { RaceMenuManager } from './RaceMenu/raceMenuManager'
import { ServerComms } from './Server/serverComms'
import { GhostRecorder } from '@vegascity/racetrack/src/ghostCar'
import { EventUI } from './UI/eventUI'
import { ShopController } from './shop/shop-controller'
import { UserData } from './Server/Helper'
import { Buildings } from './Buildings/Buildings'
import { Car } from '@vegascity/racetrack/src/car'
import * as utils from '@dcl-sdk/utils'
import { NPCManager } from './NPCs/NPCManager'

export class Scene {

    static loaded: boolean = false
    static shopController: ShopController
    
    static LoadScene(): void {
        setup(movePlayerTo, triggerSceneEmote)

        new Buildings()
        new InputManager()
        new ServerComms()

        Scene.shopController = new ShopController()
        Scene.shopController.updateCollection(UserData.cachedData.publicKey)
        Scene.shopController.setupClickables()

        new TrackManager(Vector3.create(-32, 1, 16), Quaternion.fromEulerDegrees(0, 180, 0), Vector3.create(1, 1, 1), false,
            {
                onStartEvent: () => {
                    ServerComms.recordAttempt({
                        car: ServerComms.currentCar,
                        track: ServerComms.currentTrack,
                        checkpoint: 0,
                        time: 0
                    })

                    // Load ghost from the server if we don't have a ghost for this track
                    ServerComms.getGhostCarData()

                    TrackManager.ghostRecorder.start(ServerComms.currentTrack)
                },
                onEndEvent: () => {
                    EventUI.triggerEndEvent()
                    ServerComms.recordAttempt({
                        car: ServerComms.currentCar,
                        track: ServerComms.currentTrack,
                        checkpoint: Lap.checkpointIndex + (Lap.checkpoints.length * (Lap.lapsCompleted * 2)),
                        time: Math.round(Lap.timeElapsed * 1000)
                    }).then(() => {
                        ServerComms.setTrack(ServerComms.currentTrack)
                    })

                    // Send the ghost to the server at game end
                    if (GhostRecorder.instance != null) {
                        ServerComms.sendGhostCarData(GhostRecorder.instance.getGhostData())
                    }

                    // update player data after completing a race
                    utils.timers.setTimeout(() => {
                        ServerComms.getPlayerData()
                    }, 4000)

                    utils.timers.setTimeout(() => {
                        Car.unload()
                    }, 5000)
                },
                onCheckpointEvent: () => {
                    ServerComms.recordAttempt({
                        car: ServerComms.currentCar,
                        track: ServerComms.currentTrack,
                        checkpoint: Lap.checkpointIndex + (Lap.checkpoints.length * Lap.lapsCompleted),
                        time: Math.round(Lap.timeElapsed * 1000)
                    })
                },
                onLapCompleteEvent: () => {
                    EventUI.triggerLapEvent()
                    ServerComms.recordAttempt({
                        car: ServerComms.currentCar,
                        track: ServerComms.currentTrack,
                        checkpoint: Lap.checkpointIndex + (Lap.checkpoints.length * Lap.lapsCompleted),
                        time: Math.round(Lap.timeElapsed * 1000)
                    })
                }
            },
            Vector3.create(5.5, 2.1, 1.1),
            Vector3.create(5.5, 2.1, 5)
        )
        new PhysicsManager()
        RaceMenuManager.LoadTrack(0) // load practice track by default

        new NPCManager()

        new RaceMenuManager(Vector3.create(8, 0.9, 2))

        Minimap.InitialiseAssets({
            lapImages: ["images/ui/minimapUI/lap1.png", "images/ui/minimapUI/lap2.png"],
            minimapImages: ["images/ui/minimapUI/TRACK_1.png", "images/ui/minimapUI/TRACK_2.png", "images/ui/minimapUI/TRACK_3.png", "images/ui/minimapUI/TRACK_4.png"],
            checkpointImages: [
                [
                    "images/ui/minimapUI/checkpoints/0_0.png",
                    "images/ui/minimapUI/checkpoints/0_1.png",
                    "images/ui/minimapUI/checkpoints/0_2.png",
                    "images/ui/minimapUI/checkpoints/0_3.png",
                    "images/ui/minimapUI/checkpoints/0_4.png",
                    "images/ui/minimapUI/checkpoints/0_5.png",
                    "images/ui/minimapUI/checkpoints/0_6.png",
                    "images/ui/minimapUI/checkpoints/0_7.png"
                ],
                [
                    "images/ui/minimapUI/checkpoints/1_0.png",
                    "images/ui/minimapUI/checkpoints/1_1.png",
                    "images/ui/minimapUI/checkpoints/1_2.png",
                    "images/ui/minimapUI/checkpoints/1_3.png",
                    "images/ui/minimapUI/checkpoints/1_4.png",
                    "images/ui/minimapUI/checkpoints/1_5.png",
                    "images/ui/minimapUI/checkpoints/1_6.png",
                    "images/ui/minimapUI/checkpoints/1_7.png"
                ],
                [
                    "images/ui/minimapUI/checkpoints/2_0.png",
                    "images/ui/minimapUI/checkpoints/2_1.png",
                    "images/ui/minimapUI/checkpoints/2_2.png",
                    "images/ui/minimapUI/checkpoints/2_3.png",
                    "images/ui/minimapUI/checkpoints/2_4.png",
                    "images/ui/minimapUI/checkpoints/2_5.png",
                    "images/ui/minimapUI/checkpoints/2_6.png",
                    "images/ui/minimapUI/checkpoints/2_7.png",
                    "images/ui/minimapUI/checkpoints/2_8.png"
                ],
                [
                    "images/ui/minimapUI/checkpoints/3_0.png",
                    "images/ui/minimapUI/checkpoints/3_1.png",
                    "images/ui/minimapUI/checkpoints/3_2.png",
                    "images/ui/minimapUI/checkpoints/3_3.png",
                    "images/ui/minimapUI/checkpoints/3_4.png",
                    "images/ui/minimapUI/checkpoints/3_5.png",
                    "images/ui/minimapUI/checkpoints/3_6.png",
                    "images/ui/minimapUI/checkpoints/3_7.png",
                    "images/ui/minimapUI/checkpoints/3_8.png",
                    "images/ui/minimapUI/checkpoints/3_9.png",
                    "images/ui/minimapUI/checkpoints/3_10.png",
                    "images/ui/minimapUI/checkpoints/3_11.png"
                ]
            ]
        })
        
        Scene.loaded = true
    }
} 