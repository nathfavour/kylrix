import { teams } from './client';
import { type Models } from 'appwrite';

export const TeamsService = {
    async listTeams(): Promise<Models.TeamList<Models.Team>> {
        return await teams.list();
    },

    async getTeam(teamId: string): Promise<Models.Team> {
        return await teams.get(teamId);
    },

    async createTeam(name: string, teamId?: string): Promise<Models.Team> {
        return await teams.create(teamId || 'unique()', name);
    },

    async deleteTeam(teamId: string): Promise<void> {
        await teams.delete(teamId);
    },

    async listMemberships(teamId: string): Promise<Models.MembershipList> {
        return await teams.listMemberships(teamId);
    }
};
