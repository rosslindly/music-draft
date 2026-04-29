// db.js — Raw Supabase CRUD operations

import { supabase } from './supabase.js';

// ── Users ─────────────────────────────────────────────────────────────────────

export async function dbUpsertUser({ id, handle, photo, spotifyConnected, spotifyId }) {
  const { error } = await supabase.from('users').upsert({
    id,
    handle,
    avatar_url: photo ?? null,
    spotify_connected: spotifyConnected ?? false,
    spotify_id: spotifyId ?? null,
  });
  if (error) throw error;
}

export async function dbGetUser(id) {
  const { data } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
  return data;
}

// ── Leagues ───────────────────────────────────────────────────────────────────

export async function dbCreateLeague({ id, name, inviteCode, adminId, scheduledStartDate, durationWeeks, maxTeams }) {
  const { error } = await supabase.from('leagues').insert({
    id,
    name,
    invite_code: inviteCode,
    admin_id: adminId,
    scheduled_start_date: scheduledStartDate ?? null,
    duration_weeks: durationWeeks ?? null,
    max_teams: maxTeams ?? 10,
  });
  if (error) throw error;
}

export async function dbUpdateLeague(leagueId, { name, startDate, scheduledStartDate }) {
  const updates = {};
  if (name != null) updates.name = name;
  if (startDate != null) updates.start_date = startDate;
  if (scheduledStartDate != null) updates.scheduled_start_date = scheduledStartDate;
  if (Object.keys(updates).length === 0) return;
  const { error } = await supabase.from('leagues').update(updates).eq('id', leagueId);
  if (error) throw error;
}

export async function dbAddLeagueMember(leagueId, userId, role) {
  const { error } = await supabase
    .from('league_members')
    .upsert({ league_id: leagueId, user_id: userId, role });
  if (error) throw error;
}

export async function dbGetLeagueByInviteCode(code) {
  const { data: league } = await supabase
    .from('leagues')
    .select('*')
    .eq('invite_code', code.toUpperCase())
    .maybeSingle();
  if (!league) return null;

  const { count } = await supabase
    .from('league_members')
    .select('*', { count: 'exact', head: true })
    .eq('league_id', league.id);

  const { data: adminUser } = await supabase
    .from('users')
    .select('handle')
    .eq('id', league.admin_id)
    .maybeSingle();

  return { ...league, memberCount: count ?? 0, adminHandle: adminUser?.handle ?? null };
}

export async function dbGetLeagueForUser(userId) {
  const { data } = await supabase
    .from('league_members')
    .select('role, leagues(*)')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return { ...data.leagues, role: data.role };
}

// ── Lineups ───────────────────────────────────────────────────────────────────

export async function dbSaveLineup(leagueId, userId, artists) {
  const { error } = await supabase.from('lineups').upsert({
    league_id: leagueId,
    user_id: userId,
    artists,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function dbGetLineup(leagueId, userId) {
  const { data } = await supabase
    .from('lineups')
    .select('artists')
    .eq('league_id', leagueId)
    .eq('user_id', userId)
    .maybeSingle();
  return data?.artists ?? null;
}

// ── Snapshots ─────────────────────────────────────────────────────────────────

export async function dbSaveSnapshot(leagueId, userId, weekNumber, artists) {
  const { error } = await supabase.from('listener_snapshots').upsert({
    league_id: leagueId,
    user_id: userId,
    week_number: weekNumber,
    artists,
    recorded_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function dbGetSnapshots(leagueId, userId) {
  const { data } = await supabase
    .from('listener_snapshots')
    .select('week_number, recorded_at, artists')
    .eq('league_id', leagueId)
    .eq('user_id', userId)
    .order('week_number', { ascending: true });
  return (data ?? []).map(s => ({
    week: s.week_number,
    savedAt: s.recorded_at,
    artists: s.artists,
  }));
}
