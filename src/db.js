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
    .upsert({ league_id: leagueId, user_id: userId, role }, { onConflict: 'league_id,user_id' });
  if (error) throw error;
}

export async function dbGetLeagueMembers(leagueId) {
  const { data } = await supabase
    .from('league_members')
    .select('user_id, role, users(handle)')
    .eq('league_id', leagueId);
  return (data ?? []).map(m => ({
    userId: m.user_id,
    role: m.role,
    handle: m.users?.handle ?? m.user_id,
  }));
}

export async function dbGetAllLineups(leagueId) {
  const { data } = await supabase
    .from('lineups')
    .select('user_id, artists')
    .eq('league_id', leagueId);
  return data ?? [];
}

export async function dbGetAllSnapshots(leagueId) {
  const { data } = await supabase
    .from('listener_snapshots')
    .select('user_id, week_number, artists')
    .eq('league_id', leagueId)
    .order('week_number', { ascending: true });
  return data ?? [];
}

export async function dbGetMostRecentLeague() {
  const { data } = await supabase
    .from('leagues')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
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

  const { count } = await supabase
    .from('league_members')
    .select('*', { count: 'exact', head: true })
    .eq('league_id', data.leagues.id);

  return { ...data.leagues, role: data.role, memberCount: count ?? 1 };
}

// ── Artists ───────────────────────────────────────────────────────────────────

export async function dbUpsertArtists(artists) {
  if (!artists.length) return;
  const { error } = await supabase.from('artists').upsert(
    artists.map(a => ({
      id: a.id,
      name: a.name,
      image_url: a.imageUrl ?? null,
      spotify_url: a.spotifyUrl ?? null,
      updated_at: new Date().toISOString(),
    }))
  );
  if (error) throw error;
}

export async function dbGetArtistsByIds(ids) {
  if (!ids.length) return [];
  const { data } = await supabase
    .from('artists')
    .select('id, name, image_url, spotify_url')
    .in('id', ids);
  return (data ?? []).map(a => ({
    id: a.id,
    name: a.name,
    imageUrl: a.image_url,
    spotifyUrl: a.spotify_url,
  }));
}

// ── Lineups ───────────────────────────────────────────────────────────────────

export async function dbSaveLineup(leagueId, userId, artists) {
  const { error } = await supabase.from('lineups').upsert({
    league_id: leagueId,
    user_id: userId,
    artists,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'league_id,user_id' });
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
  }, { onConflict: 'league_id,user_id,week_number' });
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
