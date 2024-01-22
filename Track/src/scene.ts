import {engine, Transform, Entity, GltfContainer} from "@dcl/sdk/ecs"
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { CarFactory } from "@vegascity/racetrack/src/car"
import { PhysicsManager } from "@vegascity/racetrack/src/physics"
import { InputManager, TrackManager } from "@vegascity/racetrack/src/racetrack"
import { setup } from "@vegascity/racetrack/src/utils"
import { setupUi } from "./UI/ui"
import * as trackConfig1 from "../data/track_01.json"
import * as trackConfig2 from "../data/track_02.json"
import * as trackConfig3 from "../data/track_03.json"
import { movePlayerTo, triggerSceneEmote } from "~system/RestrictedActions"


export class Scene {

    static LoadScene():void {

        setupUi()
        setup(movePlayerTo, triggerSceneEmote)

        new PhysicsManager()
        new InputManager()
    }

    static LoadCar(){
        CarFactory.create({
            mass: 150*0.5,
            accelerationF: 6*0.5,  
            accelerationB: 4*0.5,
            deceleration: 2*0.5,
            minSpeed: -25*0.5,
            maxSpeed: 35*0.5, 
            steerSpeed: 1.5,
            grip: 0.3,  
            engineStartAudio: 'audio/engineStart.mp3',
            carGLB: 'models/car.glb',
            carColliderGLB: 'models/carCollider.glb',
            leftWheelGLB: 'models/wheel_left.glb',
            rightWheelGLB: 'models/wheel_right.glb',
            steeringWheelGLB: 'models/steering_wheel.glb',
            wheelX_L: 1,
            wheelX_R: 1,
            wheelZ_F: 1.3,
            wheelZ_B: 1.65, 
            wheelY: 0.3,
            carScale: 0.7
        }, Vector3.create(8.45, 2, 23), 90)
    }

    static LoadTrack(_trackNumber:number){
        switch(_trackNumber){
            case 1 : new TrackManager(trackConfig1, Vector3.create(-32, 0, 16), Quaternion.fromEulerDegrees(0, 180, 0), Vector3.create(1,1,1), true) 
            break
            case 2 : new TrackManager(trackConfig2, Vector3.create(-32, 0, 16), Quaternion.fromEulerDegrees(0, 180, 0), Vector3.create(1,1,1), true)
            break
            case 3 : new TrackManager(trackConfig3, Vector3.create(-32, 0, 16), Quaternion.fromEulerDegrees(0, 180, 0), Vector3.create(1,1,1), true)
            break
        }
        Scene.LoadCar()
    }
} 