import { Transform } from "@dcl/ecs";
import { CarChoice } from "./carChoice";
import { Quaternion, Vector3 } from "@dcl/ecs-math";
import { Entity, GltfContainer, engine } from "@dcl/sdk/ecs";
import { MenuButton } from "./menuButton";
import { Car, CarPerspectives } from "@vegascity/racetrack/src/car";
import { GameManager, TrackManager } from "@vegascity/racetrack/src/racetrack";
import { Minimap } from "@vegascity/racetrack/src/ui";
import { ServerComms } from "../Server/serverComms";
import * as carConfiguration from "./carConfiguration.json"
import * as utils from '@dcl-sdk/utils'
import { EventUIEnum, EventUIImage } from "../UI/eventUIImage";
import { DemoManager } from "../DemoMode/DemoManager";
import { CrowdNPC } from "../NPCs/crowdNPC";
import { AudioManager } from "../audio/audioManager";

export class RaceMenuManager {
    static instance: RaceMenuManager

    baseEntity: Entity
    carContainer: Entity
    podiumSpinSpeed: number = 10
    podiumRotation: number = 0

    carChoices: CarChoice[] = []
    currentCarIndex: number = 0
    currentTrackIndex: number = 1

    menuTitles: Entity

    practiceButton: MenuButton
    competitionButton: MenuButton
    practiceIcon: Entity
    competitionIcon: Entity

    trackButton1: MenuButton
    trackButton2: MenuButton
    trackButton3: MenuButton
    trackButton4: MenuButton

    carButton1: MenuButton
    carButton2: MenuButton
    carButton3: MenuButton

    raceButton: MenuButton

    minimap1: Entity
    minimap2: Entity
    minimap3: Entity
    minimap4: Entity

    blockStartRaceBtn: boolean = false

    constructor(_position: Vector3) {
        this.baseEntity = engine.addEntity()
        Transform.createOrReplace(this.baseEntity, {
            position: _position,
            rotation: Quaternion.fromEulerDegrees(0, 180, 0),
            scale: Vector3.Zero()
        })

        this.carContainer = engine.addEntity()
        Transform.createOrReplace(this.carContainer, {
            parent: this.baseEntity,
            position: Vector3.create(-2.4, 1.2, -0.4),
            rotation: Quaternion.fromEulerDegrees(0, 180, 0),
            scale: Vector3.create(0.36, 0.36, 0.36)
        })

        this.initialiseMinimaps()
        this.initialiseMenu()
        this.initialiseCars()

        engine.addSystem(this.rotate.bind(this))

        RaceMenuManager.instance = this
    }

    private initialiseMinimaps(): void {
        this.minimap1 = engine.addEntity()
        Transform.createOrReplace(this.minimap1, {
            parent: this.baseEntity
        })
        GltfContainer.createOrReplace(this.minimap1, { src: "models/selection/minimap1.glb" })

        this.minimap2 = engine.addEntity()
        Transform.createOrReplace(this.minimap2, {
            parent: this.baseEntity,
            scale: Vector3.Zero()
        })
        GltfContainer.createOrReplace(this.minimap2, { src: "models/selection/minimap2.glb" })

        this.minimap3 = engine.addEntity()
        Transform.createOrReplace(this.minimap3, {
            parent: this.baseEntity,
            scale: Vector3.Zero()
        })
        GltfContainer.createOrReplace(this.minimap3, { src: "models/selection/minimap3.glb" })

        this.minimap4 = engine.addEntity()
        Transform.createOrReplace(this.minimap4, {
            parent: this.baseEntity,
            scale: Vector3.Zero()
        })
        GltfContainer.createOrReplace(this.minimap4, { src: "models/selection/minimap4.glb" })
    }

    private initialiseMenu(): void {
        this.menuTitles = engine.addEntity()
        Transform.createOrReplace(this.menuTitles, {
            parent: this.baseEntity
        })
        GltfContainer.createOrReplace(this.menuTitles, { src: "models/selection/menuTitles.glb" })

        this.initialiseGameModeMenu()
        this.initialiseTrackMenu()
        this.initialiseCarMenu()
        this.initialiseRaceMenu()
    }

    private initialiseGameModeMenu(): void {
        this.practiceIcon = engine.addEntity()
        Transform.createOrReplace(this.practiceIcon, {
            parent: this.baseEntity
        })
        GltfContainer.createOrReplace(this.practiceIcon, {
            src: "models/selection/practice_icon.glb"
        })

        this.competitionIcon = engine.addEntity()
        Transform.createOrReplace(this.competitionIcon, {
            parent: this.baseEntity,
            scale: Vector3.Zero()
        })
        GltfContainer.createOrReplace(this.competitionIcon, {
            src: "models/selection/competition_icon.glb"
        })

        this.practiceButton = new MenuButton({
            parent: this.baseEntity,
            position: Vector3.create(8.72, 6.2, -2.7),
            rotation: Quaternion.fromEulerDegrees(0, 90, 0),
            scale: Vector3.create(0.1, 0.7, 4.1),
            src: "models/selection/practice.glb",
            srcSelected: "models/selection/practice_selected.glb",
            startSelected: true,
            deselectAllCallback: this.deselectAllGameModes.bind(this),
            onSelectCallback: (() => {
                TrackManager.isPractice = true
                this.trackButton2.hide()
                this.trackButton3.hide()
                this.trackButton4.hide()
                this.trackButton1.select()

                let transformPractice = Transform.getMutableOrNull(this.practiceIcon)
                if (transformPractice) {
                    transformPractice.scale = Vector3.One()
                }
                let transformCompetition = Transform.getMutableOrNull(this.competitionIcon)
                if (transformCompetition) {
                    transformCompetition.scale = Vector3.Zero()
                }

                RaceMenuManager.update()
            }).bind(this)
        })

        this.competitionButton = new MenuButton({
            parent: this.baseEntity,
            position: Vector3.create(8.72, 5.2, -2.7),
            rotation: Quaternion.fromEulerDegrees(0, 90, 0),
            scale: Vector3.create(0.1, 0.7, 4.1),
            src: "models/selection/competition.glb",
            srcSelected: "models/selection/competition_selected.glb",
            srcWhiteCup: "models/selection/whiteCup.glb",
            srcLock: "models/selection/lock.glb",
            srcTooltip: "images/ui/tooltips/compTooltip.png",
            startLocked: true,
            deselectAllCallback: this.deselectAllGameModes.bind(this),
            onSelectCallback: (() => {
                TrackManager.isPractice = false
                this.trackButton2.show()
                this.trackButton3.show()
                this.trackButton4.show()

                let transformPractice = Transform.getMutableOrNull(this.practiceIcon)
                if (transformPractice) {
                    transformPractice.scale = Vector3.Zero()
                }
                let transformCompetition = Transform.getMutableOrNull(this.competitionIcon)
                if (transformCompetition) {
                    transformCompetition.scale = Vector3.One()
                }

                RaceMenuManager.update()
            }).bind(this),
            iconOffset: Vector3.create(-0.35, 0, 0),
            iconScale: Vector3.create(0.8, 0.8, 0.8)
        })
    }

    private initialiseTrackMenu(): void {
        this.trackButton1 = new MenuButton({
            parent: this.baseEntity,
            position: Vector3.create(3.12, 6.2, -2.7),
            rotation: Quaternion.fromEulerDegrees(0, 90, 0),
            scale: Vector3.create(0.1, 0.7, 4.1),
            src: "models/selection/track1.glb",
            srcSelected: "models/selection/track1_selected.glb",
            srcWhiteCup: "models/selection/whiteCup.glb",
            srcGoldCup: "models/selection/goldCup.glb",
            srcTooltip: "images/ui/tooltips/trackTooltip.png",
            startSelected: true,
            deselectAllCallback: this.deselectAllTracks.bind(this),
            onSelectCallback: (() => {
                this.currentTrackIndex = 1

                let transformMinimap1 = Transform.getMutableOrNull(this.minimap1)
                if (transformMinimap1) {
                    transformMinimap1.scale = Vector3.One()
                }
                let transformMinimap2 = Transform.getMutableOrNull(this.minimap2)
                if (transformMinimap2) {
                    transformMinimap2.scale = Vector3.Zero()
                }
                let transformMinimap3 = Transform.getMutableOrNull(this.minimap3)
                if (transformMinimap3) {
                    transformMinimap3.scale = Vector3.Zero()
                }
                let transformMinimap4 = Transform.getMutableOrNull(this.minimap4)
                if (transformMinimap4) {
                    transformMinimap4.scale = Vector3.Zero()
                }
            }).bind(this),
            iconOffset: Vector3.create(-0.16, 0, 0),
            iconScale: Vector3.create(0.9, 0.9, 0.9)
        })

        this.trackButton2 = new MenuButton({
            parent: this.baseEntity,
            position: Vector3.create(3.12, 5.2, -2.7),
            rotation: Quaternion.fromEulerDegrees(0, 90, 0),
            scale: Vector3.create(0.1, 0.7, 4.1),
            src: "models/selection/track2.glb",
            srcSelected: "models/selection/track2_selected.glb",
            srcLock: "models/selection/lock.glb",
            srcWhiteCup: "models/selection/whiteCup.glb",
            srcGoldCup: "models/selection/goldCup.glb",
            srcTooltip: "images/ui/tooltips/trackTooltip.png",
            startLocked: true,
            deselectAllCallback: this.deselectAllTracks.bind(this),
            onSelectCallback: (() => {
                this.currentTrackIndex = 2

                let transformMinimap1 = Transform.getMutableOrNull(this.minimap1)
                if (transformMinimap1) {
                    transformMinimap1.scale = Vector3.Zero()
                }
                let transformMinimap2 = Transform.getMutableOrNull(this.minimap2)
                if (transformMinimap2) {
                    transformMinimap2.scale = Vector3.One()
                }
                let transformMinimap3 = Transform.getMutableOrNull(this.minimap3)
                if (transformMinimap3) {
                    transformMinimap3.scale = Vector3.Zero()
                }
                let transformMinimap4 = Transform.getMutableOrNull(this.minimap4)
                if (transformMinimap4) {
                    transformMinimap4.scale = Vector3.Zero()
                }
            }).bind(this),
            iconOffset: Vector3.create(-0.16, 0, 0),
            iconScale: Vector3.create(0.9, 0.9, 0.9)
        })

        this.trackButton3 = new MenuButton({
            parent: this.baseEntity,
            position: Vector3.create(3.12, 4.2, -2.7),
            rotation: Quaternion.fromEulerDegrees(0, 90, 0),
            scale: Vector3.create(0.1, 0.7, 4.1),
            src: "models/selection/track3.glb",
            srcSelected: "models/selection/track3_selected.glb",
            srcLock: "models/selection/lock.glb",
            srcWhiteCup: "models/selection/whiteCup.glb",
            srcGoldCup: "models/selection/goldCup.glb",
            srcTooltip: "images/ui/tooltips/trackTooltip.png",
            startLocked: true,
            deselectAllCallback: this.deselectAllTracks.bind(this),
            onSelectCallback: (() => {
                this.currentTrackIndex = 3

                let transformMinimap1 = Transform.getMutableOrNull(this.minimap1)
                if (transformMinimap1) {
                    transformMinimap1.scale = Vector3.Zero()
                }
                let transformMinimap2 = Transform.getMutableOrNull(this.minimap2)
                if (transformMinimap2) {
                    transformMinimap2.scale = Vector3.Zero()
                }
                let transformMinimap3 = Transform.getMutableOrNull(this.minimap3)
                if (transformMinimap3) {
                    transformMinimap3.scale = Vector3.One()
                }
                let transformMinimap4 = Transform.getMutableOrNull(this.minimap4)
                if (transformMinimap4) {
                    transformMinimap4.scale = Vector3.Zero()
                }
            }).bind(this),
            iconOffset: Vector3.create(-0.16, 0, 0),
            iconScale: Vector3.create(0.9, 0.9, 0.9)
        })

        this.trackButton4 = new MenuButton({
            parent: this.baseEntity,
            position: Vector3.create(3.12, 3.2, -2.7),
            rotation: Quaternion.fromEulerDegrees(0, 90, 0),
            scale: Vector3.create(0.1, 0.7, 4.1),
            src: "models/selection/track4.glb",
            srcSelected: "models/selection/track4_selected.glb",
            srcLock: "models/selection/lock.glb",
            srcWhiteCup: "models/selection/whiteCup.glb",
            srcGoldCup: "models/selection/goldCup.glb",
            srcTooltip: "images/ui/tooltips/trackTooltip.png",
            startLocked: true,
            deselectAllCallback: this.deselectAllTracks.bind(this),
            onSelectCallback: (() => {
                this.currentTrackIndex = 4

                let transformMinimap1 = Transform.getMutableOrNull(this.minimap1)
                if (transformMinimap1) {
                    transformMinimap1.scale = Vector3.Zero()
                }
                let transformMinimap2 = Transform.getMutableOrNull(this.minimap2)
                if (transformMinimap2) {
                    transformMinimap2.scale = Vector3.Zero()
                }
                let transformMinimap3 = Transform.getMutableOrNull(this.minimap3)
                if (transformMinimap3) {
                    transformMinimap3.scale = Vector3.Zero()
                }
                let transformMinimap4 = Transform.getMutableOrNull(this.minimap4)
                if (transformMinimap4) {
                    transformMinimap4.scale = Vector3.One()
                }
            }).bind(this),
            iconOffset: Vector3.create(-0.16, 0, 0),
            iconScale: Vector3.create(0.9, 0.9, 0.9)
        })

        this.trackButton2.hide()
        this.trackButton3.hide()
        this.trackButton4.hide()
    }

    private initialiseCarMenu(): void {

        this.carButton1 = new MenuButton({
            parent: this.baseEntity,
            position: Vector3.create(-2.47, 6.2, -2.7),
            rotation: Quaternion.fromEulerDegrees(0, 90, 0),
            scale: Vector3.create(0.1, 0.7, 4.1),
            src: "models/selection/car1b.glb",
            srcSelected: "models/selection/car1b_selected.glb",
            startSelected: true,
            deselectAllCallback: this.deselectAllCars.bind(this),
            onSelectCallback: (() => {
                this.selectCar(0)
                RaceMenuManager.update()
            }).bind(this)
        })

        this.carButton2 = new MenuButton({
            parent: this.baseEntity,
            position: Vector3.create(-2.47, 5.2, -2.7),
            rotation: Quaternion.fromEulerDegrees(0, 90, 0),
            scale: Vector3.create(0.1, 0.7, 4.1),
            src: "models/selection/car2b.glb",
            srcSelected: "models/selection/car2b_selected.glb",
            srcLock: "models/selection/lock.glb",
            srcTooltip: "images/ui/tooltips/carTooltip.png",
            startLocked: true,
            deselectAllCallback: this.deselectAllCars.bind(this),
            onSelectCallback: (() => {
                this.selectCar(1)
                RaceMenuManager.update()
            }).bind(this)
        })

        this.carButton3 = new MenuButton({
            parent: this.baseEntity,
            position: Vector3.create(-2.47, 4.2, -2.7),
            rotation: Quaternion.fromEulerDegrees(0, 90, 0),
            scale: Vector3.create(0.1, 0.7, 4.1),
            src: "models/selection/car3b.glb",
            srcSelected: "models/selection/car3b_selected.glb",
            srcLock: "models/selection/lock.glb",
            srcTooltip: "images/ui/tooltips/carTooltip.png",
            startLocked: true,
            deselectAllCallback: this.deselectAllCars.bind(this),
            onSelectCallback: (() => {
                this.selectCar(2)
                RaceMenuManager.update()
            }).bind(this)
        })
    }

    private initialiseRaceMenu(): void {
        this.raceButton = new MenuButton({
            parent: this.baseEntity,
            position: Vector3.create(-8.05, 5.7, -2.7),
            rotation: Quaternion.fromEulerDegrees(0, 90, 0),
            scale: Vector3.create(0.1, 1.7, 4.15),
            src: "models/selection/race.glb",
            onSelectCallback: this.startRace.bind(this)
        })
    }

    private initialiseCars(): void {
        this.carChoices.push(new CarChoice(0, "models/selection/car3.glb", {
            parent: this.carContainer,
            position: Vector3.Zero(),
            rotation: Quaternion.Identity(),
            scale: Vector3.One()
        }, Vector3.create(-41, 1.4, 20)))

        this.carChoices.push(new CarChoice(1, "models/selection/car2.glb", {
            parent: this.carContainer,
            position: Vector3.Zero(),
            rotation: Quaternion.Identity(),
            scale: Vector3.One()
        }, Vector3.create(-41, 1.4, 30)))

        this.carChoices.push(new CarChoice(2, "models/selection/car1.glb", {
            parent: this.carContainer,
            position: Vector3.Zero(),
            rotation: Quaternion.Identity(),
            scale: Vector3.One()
        }, Vector3.create(-41, 1.4, 40)))

        this.carChoices[0].show()
    }

    private deselectAllGameModes(): void {
        this.practiceButton.deselect()
        this.competitionButton.deselect()
    }

    private deselectAllTracks(): void {
        this.trackButton1.deselect()
        this.trackButton2.deselect()
        this.trackButton3.deselect()
        this.trackButton4.deselect()
    }

    private deselectAllCars(): void {
        this.carButton1.deselect()
        this.carButton2.deselect()
        this.carButton3.deselect()
    }

    private rotate(_dt: number): void {
        this.podiumRotation += _dt * this.podiumSpinSpeed
        if (this.podiumRotation > 360) { this.podiumRotation -= 360 }

        let carContainerTransform = Transform.getMutableOrNull(this.carContainer)
        if (carContainerTransform) {
            carContainerTransform.rotation = Quaternion.fromEulerDegrees(0, this.podiumRotation, 0)
        }
    }

    private selectCar(_index: number): void {
        this.currentCarIndex = _index
        RaceMenuManager.hideAllCars()
        RaceMenuManager.instance.carChoices[this.currentCarIndex].show()
    }

    private startRace(): void {
        if (!this.blockStartRaceBtn) {
            this.blockStartRaceBtn = true

            DemoManager.hide()
            CrowdNPC.instance.show()

            let self = this
            let trackNumber = RaceMenuManager.instance?.practiceButton.selected ? 0 : this.currentTrackIndex
            AudioManager.playMusic(Math.max(0, trackNumber - 1))
            RaceMenuManager.LoadTrack(trackNumber)
            RaceMenuManager.instance.carChoices[this.currentCarIndex].LoadCar()

            utils.timers.setTimeout(() => {
                let activeCar = Car.getActiveCar()
                if (activeCar) {
                    CarPerspectives.enterCar(activeCar.data)
                }
                self.raceButton.deselect()
                EventUIImage.triggerEvent(EventUIEnum.preEvent)
            }, 500)

            utils.timers.setTimeout(function () {
                self.blockStartRaceBtn = false
            }, 3000)
        }
    }

    static update(): void {
        if (!RaceMenuManager.instance || !ServerComms.player) return

        //update cars
        ServerComms.player.cars.forEach(car => {
            for (let carIndex = 0; carIndex < carConfiguration.cars.length; carIndex++) {
                let carGuid = carConfiguration.cars[carIndex].guid
                if (car.guid == carGuid) {
                    if (carIndex == 1) {
                        RaceMenuManager.instance.carButton2.unlock()
                    }
                    else if (carIndex == 2) {
                        RaceMenuManager.instance.carButton3.unlock()
                    }
                }
            }
        })

        let selectedCarIndex = RaceMenuManager.instance.carButton1.selected ? 0 : (RaceMenuManager.instance.carButton2.selected ? 1 : 2)
        let selectedCarGuid = carConfiguration.cars[selectedCarIndex].guid

        RaceMenuManager.instance.trackButton2.lock()
        RaceMenuManager.instance.trackButton3.lock()
        RaceMenuManager.instance.trackButton4.lock()
        RaceMenuManager.instance.trackButton1.setUnqualified()

        //update tracks
        ServerComms.player.tracks.forEach(track => {
            track.cars.forEach(car => {
                if (car.guid == selectedCarGuid) {
                    if (track.guid == "17e75c78-7f17-4b7f-8a13-9d1832ec1231") {
                        RaceMenuManager.instance.trackButton2.unlock()
                    }
                    else if (track.guid == "ec2a8c30-678a-4d07-b56e-7505ce8f941a") {
                        RaceMenuManager.instance.trackButton3.unlock()
                    }
                    else if (track.guid == "a8ceec44-5a8f-4c31-b026-274c865ca689") {
                        RaceMenuManager.instance.trackButton4.unlock()
                    }
                }
            })

            track.carPbsPerTrack.forEach(carPb => {
                const carPbInMilli = carPb.PB * 1000
                if (carPb.car == selectedCarGuid && carPbInMilli > 0 && carPbInMilli < track.targetTimeToUnlockNextTrack) {
                    if (track.guid == "6a0a3950-bcfb-4eb4-9166-61edc233b82b" && RaceMenuManager.instance.competitionButton.selected) {
                        RaceMenuManager.instance.trackButton1.setQualified()
                    }
                    else if (track.guid == "17e75c78-7f17-4b7f-8a13-9d1832ec1231") {
                        RaceMenuManager.instance.trackButton2.setQualified()
                    }
                    else if (track.guid == "ec2a8c30-678a-4d07-b56e-7505ce8f941a") {
                        RaceMenuManager.instance.trackButton3.setQualified()
                    }
                    else if (track.guid == "a8ceec44-5a8f-4c31-b026-274c865ca689") {
                        RaceMenuManager.instance.trackButton4.setQualified()
                    }
                }
            })
        })

        if (ServerComms.player.practiceCompleted) {
            RaceMenuManager.instance.competitionButton.unlock()

            if (RaceMenuManager.instance.practiceButton.selected) {
                RaceMenuManager.instance.trackButton1.setQualified()
            }
        }

        if ((RaceMenuManager.instance.trackButton2.selected && RaceMenuManager.instance.trackButton2.locked)
            || (RaceMenuManager.instance.trackButton3.selected && RaceMenuManager.instance.trackButton3.locked)
            || (RaceMenuManager.instance.trackButton4.selected && RaceMenuManager.instance.trackButton4.locked)) {
            RaceMenuManager.instance.trackButton1.select()
        }
    }

    static LoadTrack(_trackNumber: number) {
        let totalLaps = 2
        let trackGuid = ""
        GameManager.reset()
        switch (_trackNumber) {
            case 0: trackGuid = "6a0a3950-bcfb-4eb4-9166-61edc233b82b"
                totalLaps = 1
                TrackManager.isPractice = true
                break
            case 1: trackGuid = "6a0a3950-bcfb-4eb4-9166-61edc233b82b"
                TrackManager.isPractice = false
                break
            case 2: trackGuid = "17e75c78-7f17-4b7f-8a13-9d1832ec1231"
                TrackManager.isPractice = false
                break
            case 3: trackGuid = "ec2a8c30-678a-4d07-b56e-7505ce8f941a"
                TrackManager.isPractice = false
                break
            case 4: trackGuid = "a8ceec44-5a8f-4c31-b026-274c865ca689"
                TrackManager.isPractice = false
                break
        }

        ServerComms.setTrack(trackGuid)
        TrackManager.Load(trackGuid)

        let lap = TrackManager.GetLap()
        if (!lap) return

        lap.totalLaps = totalLaps

        Minimap.Load(
            {
                srcWidth: 992,
                srcHeight: 815,
                parcelWidth: 11,
                parcelHeight: 9,
                bottomLeftX: -32,
                bottomLeftZ: 16,
                offsetX: 0.75,
                offsetZ: 0.75,
                paddingBottom: 51,
                paddingTop: 45,
                paddingLeft: 60,
                paddingRight: 50,
                scale: 0.3
            }
        )
    }

    static hideAllCars(): void {
        RaceMenuManager.instance.carChoices.forEach(car => {
            car.hide()
        });
    }
}