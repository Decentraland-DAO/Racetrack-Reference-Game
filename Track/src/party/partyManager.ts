import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { LeaderboardUI } from "../UI/leaderboardUI";
import { DJ } from "./dj";
import { Schedule, ScheduleManager } from "./scheduleManager";
import { Countdown3d } from "../UI/countdown3d";
import { PodiumNPCs } from "./podiumNPC";
import { FireWorkManager } from "../Fireworks/fireworkManager";
import { ConfettiManager } from "../Confetti/confettiManager";

export class PartyManager {
    dj: DJ
    leaderboard: LeaderboardUI
    podiumNPCs: PodiumNPCs
    fireworkManager: FireWorkManager
    confettiManager: ConfettiManager

    constructor() {
        this.fireworkManager = new FireWorkManager()
        this.confettiManager = new ConfettiManager()

        this.leaderboard = new LeaderboardUI(Vector3.create(39, 10, 98), Quaternion.fromEulerDegrees(0, -75, 0), Vector3.create(0.3, 0.3, 0.3), 6, 2.05, false)
        this.leaderboard.hide()

        // Party starts in... 7:30-8:00 pm
        new Countdown3d(new Date('2024-03-17T19:30:00'), 30 * 60, Vector3.create(87.8, 12.1, 103.1), Quaternion.fromEulerDegrees(0, 262.5, 0), Vector3.create(2, 2, 2))
        new Countdown3d(new Date('2024-03-17T19:30:00'), 30 * 60, Vector3.create(79.5, 12.1, 76.6), Quaternion.fromEulerDegrees(0, -47, 0), Vector3.create(2, 2, 2))
        
        // Racing ends in... 8:00-8:27 pm
        new Countdown3d(new Date('2024-03-17T20:00:00'), 27 * 60, Vector3.create(87.8, 12.1, 103.1), Quaternion.fromEulerDegrees(0, 262.5, 0), Vector3.create(2, 2, 2))
        new Countdown3d(new Date('2024-03-17T20:00:00'), 27 * 60, Vector3.create(79.5, 12.1, 76.6), Quaternion.fromEulerDegrees(0, -47, 0), Vector3.create(2, 2, 2))


        // DJ
        ScheduleManager.instance.registerSchedule(
            new Schedule(
                Date.UTC(2024, 2, 17, 20, 0),
                Date.UTC(2024, 2, 17, 20, 30),
                () => {
                    this.dj = new DJ()
                },
                () => {
                    if (this.dj != undefined) {
                        this.dj.remove()
                    }
                }
            )
        )

        // 60 seconds of fire works go off between 8.33-8.48 pm
        ScheduleManager.instance.registerSchedule(
            new Schedule(
                Date.UTC(2024, 1, 17, 20, 33),
                Date.UTC(2024, 2, 17, 20, 47), // -60 secs So the fire works don't overlap with the next bit
                ()=>{
                    // LAUNCH! pew pew pew
                    this.fireworkManager.startDisplay()
                    this.confettiManager.start()
                },
                ()=>{
                    // It'll end itself.
                }
            )
        )

        // Leader board + winner stand npcs
        ScheduleManager.instance.registerSchedule(
            new Schedule(
                Date.UTC(2024, 2, 17, 20, 0),
                Date.UTC(2024, 2, 17, 20, 45),
                () => {
                    this.leaderboard.show()
                    this.podiumNPCs = new PodiumNPCs()
                },
                () => {
                    this.leaderboard.hide()
                    if (this.podiumNPCs != undefined) {
                        this.podiumNPCs.remove()
                    }
                }
            )
        )
    }
}