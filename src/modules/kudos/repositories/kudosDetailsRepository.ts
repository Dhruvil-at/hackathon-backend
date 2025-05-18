/**
 * Repository interface for fetching additional details needed for kudos
 * This keeps the kudos module isolated from other modules
 */
export interface KudosDetailsRepository {
  getUserNameById(id: number | string): Promise<string>;
  getCategoryNameById(id: number): Promise<string>;
  getTeamNameById(id: number): Promise<string>;
}
