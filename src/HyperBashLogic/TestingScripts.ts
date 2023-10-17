import { KillFeedLayout, PlayerJoinsLayout } from "@/interfaces/HyperBashMessages.interface";
import { getRandomArbitrary, getRandomInt } from "@/Util/UtilFunctions";
import { MatchType } from "../interfaces/StoreInterfaces/MatchInfo";
import { useMatchStateStore } from "../stores/MatchStateStore";
import { EventCurrentlySpectating, EventDashUpdate, EventHealthUpdate, EventKillFeed, EventPlayerJoins, EventPlayerLeaves, EventScoreboard } from "./HyperBashEvents";

let fakeDataInterval = 0;

export function CreateFakeData() {

	const state = useMatchStateStore();

	clearInterval(fakeDataInterval);

	for (let i = state.GetPlayers.length - 1; i >= 0; i--) {
		EventPlayerLeaves.invoke({
			playerID: i,
			type: "playerLeaves",
		});
	}

	var teams = ["UNSC", "D", "ARC", "F1R3", "HHI", "DARK"];
	var redTeam = teams[Math.floor(Math.random() * teams.length)];
	teams.splice(teams.indexOf(redTeam), 1);
	var blueTeam = teams[Math.floor(Math.random() * teams.length)];

	for (let teamIndex = 0; teamIndex < 2; teamIndex++) {
		var currentTeam = teamIndex == 0 ? redTeam : blueTeam;

		for (let i = 0; i < 5; i++) {
			EventPlayerJoins.invoke({
				type: "playerJoins",
				playerID: i + teamIndex * 5,
				name: Math.random().toString(16).substr(2, 16),
				clanTag: currentTeam,
				team: teamIndex,
				id: "3h5gf7vb65k4iuytfd7cv6b5",
				level: getRandomInt(0, 100),
			} as PlayerJoinsLayout);
		}
	}

	EventScoreboard.invoke({
		type: "scoreboard",
		deads: [...Array(11).keys()].map(() => getRandomInt(0, 40)),
		kills: [...Array(11).keys()].map(() => getRandomInt(0, 40)),
		scores: [...Array(11).keys()].map(() => getRandomInt(0, 100000)),
		pings: [...Array(11).keys()].map(() => getRandomInt(0, 3)),
	});

	// TODO needs to be like how the game will call it
	var matchTypeValue = [1, 2, 5][Math.floor(Math.random() * 3)],
		redScore = getRandomInt(0, 3),
		blueScore = getRandomInt(0, 3);

	if (matchTypeValue == MatchType.Payload) {
		redScore = getRandomInt(0, 101);
		blueScore = getRandomInt(0, 101);
	} else if (matchTypeValue == MatchType.ControlPoint) {
		redScore = getRandomInt(0, 301);
		blueScore = getRandomInt(0, 301);
	}

	state.$patch({
		MatchInfo:{
			timer: getRandomInt(60, 1500),
			blueScore: blueScore,
			redScore: redScore,
			controlPoint: {
				TeamScoringPoints: getRandomInt(1, 3),
			},
			domination: {
				countDownTimer: getRandomInt(0, 5),
				pointA: getRandomInt(0, 3),
				pointB: getRandomInt(0, 3),
				pointC: getRandomInt(0, 3),
				teamCountDown: getRandomInt(0, 3),
			},
			payload: {
				amountBlueOnCart: getRandomInt(0, 4),
				cartBlockedByRed: false,
				checkPoint: false,
				secondRound: false,
				precisePayloadDistance: getRandomArbitrary(0, 1),
			},
			matchType: matchTypeValue
		}
	});

	EventCurrentlySpectating.invoke({
		type: "currentlySpectating",
		playerID: getRandomInt(0, 9),
	});

	for (let i = 0; i < 2; i++) {
		var randomNumbers = [0,1,2,7,8,9,11];
		
		var team = getRandomInt(0,2);
		
		if ( team == 0 ) {
			var victim = getRandomInt(0,4),
					killer = getRandomInt(5,9);
		}
		else {
			var victim = getRandomInt(5,9),
					killer = getRandomInt(0,4);
		}
		
		var thing : KillFeedLayout = {
			type: "killFeed",
			victim: victim,
			headShot: Math.random() < 0.5,
			isAltFire: false, //false,
			killer: killer,
			weaponType: randomNumbers[getRandomInt(-1,randomNumbers.length)] || -1,
			killStreak: getRandomInt(0,6)
		}
		
		let explosives = [0, 11];
		thing.isAltFire = explosives.includes(thing.weaponType);
		// console.table(thing);
		
		EventKillFeed.invoke(thing);
	}

	for (let i = 0; i < 11; i++) {
		if (state.GetPlayers[i] != null) {
			var dashPickup = getRandomArbitrary(0, 1) > 0.5;
			EventDashUpdate.invoke({
				type: "dashUpdate",
				playerID: i,
				dashAmount: getRandomArbitrary(0, dashPickup ? 5 : 3),
				hasDashUpgrade: dashPickup,
				isDashing: false,
				isFalling: false,
				isSprinting: false,
			});

			EventHealthUpdate.invoke({
				type: "healthUpdate",
				playerID: i,
				health: getRandomArbitrary(0, 101),
			});
		}
	}

	fakeDataInterval = setInterval(() => {
		// let feetArray = [];
		// for (let i = 0; i < store.state.GetPlayers.length; i++) {
		// 	feetArray.push(
		// 		store.state.GetPlayers[i].feetPosition.X +
		// 			getRandomArbitrary(-1, 1)
		// 	);
		// 	feetArray.push(
		// 		store.state.GetPlayers[i].feetPosition.Y +
		// 			getRandomArbitrary(-1, 1)
		// 	);
		// 	feetArray.push(
		// 		store.state.GetPlayers[i].feetPosition.Z +
		// 			getRandomArbitrary(-1, 1)
		// 	);
		// 	var dash = store.state.GetPlayers[i].dash * .7;
		// 	// store.commit("dashUpdate", {
		// 	// 	type:"dashUpdate",
		// 	// 	playerID:i,
		// 	// 	dashAmount: dash <= 0.5 ? (store.state.GetPlayers[i].dashPickup ? 5 : 3) : dash,
		// 	// 	dashPickUp: dashPickup
		// 	// })
		// 	// store.commit("healthUpdate", {
		// 	// 	type:"healthUpdate",
		// 	// 	playerID:i,
		// 	// 	health: getRandomArbitrary(0, 101)
		// 	// })
		// }
		// store.commit("playerPos", {
		// 	type: "playerPos",
		// 	feetDirection: [...Array(10).keys()].map(() => 0),
		// 	feetPos: feetArray,
		// } as playerPos);
	}, 10);
}
