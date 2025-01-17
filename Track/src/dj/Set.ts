/* imports */

import { AnimatorSystem } from "./AnimatorSystem"
import { AudioStream } from "./AudioStream"
import { ControlPadIntensity } from "./ControlPad"
import { DJ } from "./DJ"
import { MixTable } from "./MixTable"
import { SetConfig } from "./SetConfig"
import { SyncSystem } from "./SyncSystem"
import { Utils } from "./Utils"
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import { Transform, engine } from "@dcl/sdk/ecs"
import * as utils from '@dcl-sdk/utils'

/* class definition */

export class Set {

    /* fields */

    // references
    audioStream: AudioStream | null
    dj: DJ
    mixTable: MixTable

    // config
    position: Vector3 = Vector3.Zero()
    rotation: Quaternion = Quaternion.Identity()
    scale: Vector3 = Vector3.Zero()
    url: string = ""
    volume: number = 1
    showDJ: boolean = false

    iswhiteListed: boolean = false

    // state
    intensity: ControlPadIntensity
    bpmBeenSet: boolean = false

    // bus
    private hasResetDJ = false
    private djBaseScale: Vector3 = Vector3.Zero()

    /* constructor */

    constructor(_config: SetConfig) {

        // parse the config
        this.position = _config.position ?? Vector3.Zero()
        this.rotation = _config.rotation ?? Quaternion.Identity()
        this.scale = _config.scale ?? Vector3.One()
        this.url = _config.url ?? ""
        this.volume = _config.volume ?? 1
        this.showDJ = _config.showDJ ?? true

        // initialise state
        this.intensity = "NORMAL"

        // initialise systems
        if (this.showDJ) {
            const animatorSystem = AnimatorSystem.getInstance()
            engine.addSystem(animatorSystem.update.bind(animatorSystem))
        }
        const syncSystem = SyncSystem.getInstance()
        engine.addSystem(syncSystem.update.bind(syncSystem))

        // initialise the audio
        if (this.url !== null) {
            this.audioStream = new AudioStream(this.url)
            this.audioStream
                .setLooping(false)
                .setVolume(this.volume)
                .play()
        }
        else {
            this.audioStream = null
            console.log("No URL defined for audio stream")
        }

        // initialise mixtable
        // this.mixTable = new MixTable({
        //     position: this.pointToSetSpace(Vector3.Zero()),
        //     rotation: this.rotationToSetSpace(Quaternion.Identity()),
        //     scale: this.scaleToSetSpace(Vector3.One())
        // })

        // initialise dj
        if (this.showDJ) {
            this.dj = new DJ({
                position: this.pointToSetSpace(Vector3.Zero()),
                rotation: this.rotationToSetSpace(Quaternion.Identity()),
                scale: this.scaleToSetSpace(Vector3.One())
            })

            let djTransform = Transform.getMutableOrNull(this.dj.entity)
            if (djTransform) {
                this.djBaseScale = Vector3.clone(djTransform.scale)
                djTransform.scale = Vector3.Zero()
            }
        }

        // hook into beat detection
        SyncSystem.getInstance().onBeat(((_target) => (_isPrimary: boolean, _beat: number) => _target.onBeat(_isPrimary, _beat))(this))

        if (this.showDJ) {
            utils.timers.setTimeout(() => {
                ((_target: Set) => {
                    return () => {
                        if (!_target.hasResetDJ) {
                            _target.hasResetDJ = true
                            utils.timers.setTimeout(() => {
                                let djTransform = Transform.getMutableOrNull(_target.dj.entity)
                                if (djTransform) {
                                    djTransform.scale = _target.djBaseScale
                                }
                                _target.dj.initialiseAnimator()
                                if (_target.dj.animator !== undefined && _target.dj.animator !== null) {
                                    _target.dj.animator.loop("DJ_TurnTableLoop", false)
                                    console.log("looping DJ_TurnTableLoop")
                                }
                                else {
                                    console.log("unable to loop DJ_TurnTableLoop")
                                }
                            }, 2000)
                        }
                    }
                })(this)
            }, 15000)
        }
    }

    /* methods */
    onBeat(_isPrimary: boolean, _beat: number): void {

        //console.log(_beat + (_isPrimary ? "!" : ""))
        if (this.dj === undefined || this.dj === null) {
            return
        }
        if (this.dj.animator === undefined || this.dj.animator === null) {
            //console.log("no animator!")
            return
        }

        //console.log(this.intensity)
        switch (this.intensity) {
            case "OFF": {

            } break
            case "NORMAL": {

                if (_isPrimary) {
                    this.dj.animator.loop("DJ_TurnTableLoop", true)
                }
            } break
            case "HIGH": {
                if (_isPrimary) {
                    this.dj.animator.loop(Math.random() < 0.5 ? "DJ_TurnTableLoop" : "DJ_RaisedHands", true)
                }
            } break
            default: {
                console.log("Unrecognised intensity = " + this.intensity)
            } break
        }
    }

    pointToSetSpace(_point: Vector3): Vector3 {
        return Vector3.add(this.position, Vector3.multiply(Utils.multiplyVectorByQuaternion(this.rotation, _point), this.scale))
    }

    rotationToSetSpace(_rotation: Quaternion): Quaternion {
        return Quaternion.multiply(_rotation, this.rotation)
    }

    scaleToSetSpace(_scale: Vector3): Vector3 {
        return Vector3.multiply(_scale, this.scale)
    }
}