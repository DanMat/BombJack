/*
 * BombJack configuration.
 *
 * Uses the SAME shared Supabase project as the other games — the leaderboard
 * `scores` table is namespaced by `gameId`, so BombJack's board is separate
 * from Paddix's. The publishable key is public by design and safe to embed;
 * the database is protected by the row-level-security policies in
 * docs/supabase.sql. Blank the URL/key to fall back to a local leaderboard.
 */
window.GAME_CONFIG = {
	supabaseUrl: 'https://ukgzauknjbeotyfyvyva.supabase.co',
	supabaseAnonKey: 'sb_publishable_9UoiuT32HIMAVhBhOCvlOw_BfvMAbBT',

	gameId: 'bombjack',
	leaderboardSize: 10
};
