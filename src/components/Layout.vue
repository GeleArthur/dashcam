<template>
	<div class="container">
		<team :team="1" /> <!-- blue -->
		<scoreboard />
		<team :team="0" /> <!-- red -->
		<player-bar />
		<kill-feed />
	</div>
</template>

<style lang="css">
.container {
	display: grid;
	height: 100vh;
	grid-template-columns: 538px auto 538px;
	grid-template-rows: 1fr 1fr;
	text-align: center;
}

.dashes {
	display: flex;
	height: 21px;
	justify-content: space-between;
	position: relative;
	width: 100%;
}

.dashes .dash {
	height: 100%;
	position: relative;
	width: 21px;
}

.dashes .dash--max {
	width: 11px;
}

.dashes .dashes_fill {
	background-color: rgba(255, 255, 255, 0.6);
	display: block;
	height: 100%;
	position: relative;
	transform: skew(-20deg);
	transition: width 0.1s ease-in-out;
	z-index: 5;
}

.dashes .dashes_track {
	background-color: rgba(255, 255, 255, 0.1);
	bottom: 0;
	left: 0;
	position: absolute;
	right: 0;
	top: 0;
	transform: skew(-20deg);
	z-index: 1;
}

.player--dead .dashes_track {
	background-color: rgba(0, 0, 0, 0.2);
}

.healthBar {
	display: block;
	height: 21px;
	position: relative;
	width: 100%;
}

.healthBar .healthBar_life {
	background-color: rgba(255, 255, 255, 0.6);
	display: block;
	height: 100%;
	position: relative;
	transform: skew(20deg);
	transition: width 0.1s ease-in-out;
	z-index: 5;
}

.healthBar .healthBar_track {
	background-color: rgba(255, 255, 255, 0.1);
	bottom: -1px;
	left: -1px;
	position: absolute;
	right: -1px;
	top: -1px;
	transform: skew(20deg);
	z-index: 1;
}

.player--dead .healthBar .healthBar_track {
	background-color: rgba(0, 0, 0, 0.2);
}
</style>

<script setup lang="ts">
import { EventSceneChange } from "@/HyperBashLogic/HyperBashEvents";
import { iconModes, TeamInfo } from "@/interfaces/StoreInterfaces/StoreState";
import { useMatchStateStore } from "@/stores/MatchStateStore";
import { useSettingStore } from "@/stores/SettingsStore";
import { watch } from "vue";
import KillFeed from "./KillFeed.vue";
import PlayerBar from "./PlayerBar.vue";
import Scoreboard from "./Scoreboard.vue";
import Team from "./Team.vue";

const state = useMatchStateStore();
const settingState = useSettingStore();

watch(() => state.TeamData.red.name, () => {
	getTeamInfo(true);
})

watch(() => state.TeamData.blue.name, () => {
	getTeamInfo(false);
})

watch(() => settingState.IconSettings.iconMode, () => {
	getTeamInfo(false);
	getTeamInfo(true);
})

async function getTeamInfo(updateRed: boolean) {
	const teamName: string = updateRed ? state.TeamData.red.name : state.TeamData.blue.name;
	let newTeamData = { name: teamName } as TeamInfo

	// dashleague
	if (settingState.IconSettings.iconMode == iconModes.dashLeague) {
		try {
			const team = await fetch(`https://dashleague.games/api/v1/team?teamName=${teamName}`, {
			method: 'GET',
			headers: {
				'X-User-Identifier': 'casting'
			}
			});

			const teamJson = await team.json();

			newTeamData.logoFound = false;

			if (team.ok) {
				newTeamData.logoFound = true;
				newTeamData.logo = teamJson.logo;
			}
		}
		catch (e) {
			newTeamData.logoFound = false;
			console.error("Failed to get logo falling back " + e);
		}
	}
	else if (settingState.IconSettings.iconMode == iconModes.hyperCup) {
		try {
			let logoURL = `https://www.hyperdashcup.com/dashcam/logos/${teamName}.png`;

			const logoRequest = await fetch(logoURL);

			// Sucks that we have to request twice any other way?
			if (logoRequest.ok) {
				newTeamData.logoFound = true;
				newTeamData.logo = logoURL;
			}
			else {
				newTeamData.logoFound = false;
			}
		}
		catch (e) {
			newTeamData.logoFound = false;
			console.log("Failed to get logo falling back " + e)
		}
	}
	else if (settingState.IconSettings.iconMode == iconModes.custom) {
		newTeamData.logoFound = true;
	}

	if (updateRed) {
		state.$patch({
			TeamData: {
				red: newTeamData
			}
		})
	} else {
		state.$patch({
			TeamData: {
				blue: newTeamData
			}
		})
	}
}
</script>