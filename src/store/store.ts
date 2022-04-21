import { playerInfo } from "../models/playerInfo";
import { createStore } from "vuex";
import { getImage } from "../Util/UtilFunctions";

import matchInfo, { mapName, matchType, teams } from "../models/matchInfo";
import playerJoins from "../models/HyperBashModels/playerJoins";
import playerPos from "../models/HyperBashModels/playerPos";
import LoadoutUpdate from "../models/HyperBashModels/LoadoutUpdate";
import killFeedData from "../models/HyperBashModels/killFeedData";

export default createStore({
	state: {
		connection: "Failed",
		selectedIndex: -1,
		PlayerData: [] as (playerInfo | undefined)[],
		matchInfo: {} as matchInfo,
	},
	mutations: {
		playerJoins(state, socketData: playerJoins) {
			state.PlayerData[socketData.playerID] = {
				playerID: socketData.playerID,
				name: socketData.name,
				clan: socketData.clanTag,
				team: socketData.team,
				leftWeapon: {
					imageSource: "./assets/gun-pistol.png",
					weaponName: "DefaultPistol",
				},
				rightWeapon: {
					imageSource: "./assets/gun-pistol.png",
					weaponName: "DefaultPistol",
				},
				health: 100,
				dash: 3,
				dashPickup: false,
				isDead: false,
				score: 0,
				deads: 0,
				kills: 0,
				ping: 0,

				feetPosition: { X: 0, Y: 0, Z: 0 },
				feetRotation: 0,
			};
		},
		playerLeaves(state, socketData: any) {
			state.PlayerData[socketData.playerID] = undefined;
		},

		loadoutUpdate(state, socketData: LoadoutUpdate) {
			state.PlayerData[socketData.playerID]!.leftWeapon = {
				imageSource: getImage(socketData.leftHand),
				weaponName: socketData.leftHand,
			};

			state.PlayerData[socketData.playerID]!.rightWeapon = {
				imageSource: getImage(socketData.rightHand),
				weaponName: socketData.rightHand,
			};
		},
		switchTeam(state, socketData: any) {
			state.PlayerData[socketData.playerID]!.team = socketData.team;
		},
		killFeed(state, socketData: killFeedData) {
			state.PlayerData[socketData.victim]!.isDead = true;
		},
		respawn(state, socketData: any) {
			state.PlayerData[socketData.playerID]!.isDead = false;
		},
		healthUpdate(state, socketData: any) {
			state.PlayerData[socketData.playerID]!.health = socketData.health;
		},
		CurrentlySpectating(state, socketData: any) {
			state.selectedIndex = socketData.playerID;
		},
		scoreboard(state, socketData: any) {
			for (let i = 0; i < state.PlayerData.length; i++) {
				if (state.PlayerData[i] != undefined) {
					state.PlayerData[i]!.deads = socketData.deads[i];
					state.PlayerData[i]!.kills = socketData.kills[i];
					state.PlayerData[i]!.score = socketData.scores[i];
				}
			}
		},
		playerPos(state, socketData: playerPos) {
			for (let i = 0; i < socketData.feetPos.length / 3; i++) {
				if (state.PlayerData[i] != undefined) {
					state.PlayerData[i]!.feetPosition = {
						X: socketData.feetPos[i * 3 + 0],
						Y: socketData.feetPos[i * 3 + 1],
						Z: socketData.feetPos[i * 3 + 2],
					};

					state.PlayerData[i]!.feetRotation = socketData.feetDirection[i];
				}
			}
		},
		status(state, socketData: any) {
			1 + 1;
		},
		dashUpdate(state, socketData: any) {
			if(state.PlayerData[socketData.playerID] != undefined){
				state.PlayerData[socketData.playerID]!.dash = socketData.dashAmount;
				state.PlayerData[socketData.playerID]!.dashPickup = socketData.dashPickUp;
			}
		},
		matchStart(state, socketData: any){
			state.matchInfo.blueTeamName = socketData.blueTeamName;
			state.matchInfo.redTeamName = socketData.redTeamName;
			state.matchInfo.matchtype = socketData.matchType;
			state.matchInfo.mapname = socketData.mapName;
		},

		timer(state, socketData: any){
			state.matchInfo.timer = socketData.time;
		},

		teamScore(state, socketData: any){
			console.log(socketData)
			state.matchInfo.blueScore = socketData.blueTeam;
			state.matchInfo.redScore = socketData.redTeam;
		},

		// Will not be called by hyperBash
		init(state, payload) {
			for (let i = 0; i < 10; i++) {
				state.PlayerData[i] = undefined;
			}
		},

		changeConnection(state, connectionType) {
			state.connection = connectionType;
		},

		matchInfo(state, socketData: any) {
			state.matchInfo = {
				payload: {
					amountBlueOnCart: socketData.payload.amountBlueOnCart,
					cartBlockedByRed: socketData.payload.cartBlockedByRed,
					checkPoint: socketData.payload.checkPoint,
					secondRound: socketData.payload.secondRound,
				},
				domination: {
					countDownTimer: socketData.domination.countDownTimer,
					teamCountDown: socketData.domination.teamCountDown,
					pointA: socketData.domination.pointA,
					pointB: socketData.domination.pointB,
					pointC: socketData.domination.pointC,
				},
				controlPoint: {
					TeamScoringPoints: socketData.controlPoint.TeamScoringPoints,
				},
				blueScore:socketData.blueScore,
				redScore:socketData.redScore,
				blueTeamName: socketData.blueTeamName,
				redTeamName: socketData.redTeamName,
				mapname: mapName.lauchpad,
				matchtype: socketData.matchtype,
				timer: socketData.timer,
			};
		},
	},
	actions: {},
	modules: {},
});
