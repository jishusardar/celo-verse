import { useState } from "react";
import { supabase } from "./supabase/supabase";

//check user exist or not
export async function existProfile(walletAddress) {
    
    const { data: profileData, error: findError } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single();

    if (findError && findError.code !== "PGRST116") {
        console.error("Error checking player:", findError);
        throw new Error("Database check failed");
    }

    if (profileData) {
        return profileData;
    }
}

//user creation
export async function upsertUser(walletAddress, username) {
    const { data: existing, error: findError } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single();

    if (findError && findError.code !== "PGRST116") {
        console.error("Error checking player:", findError);
        throw new Error("Database check failed");
    }

    if (existing) {
        alert('Profile already exist')
        return existing;
    }

  const { data, error } = await supabase
    .from('users')
    .upsert({ wallet_address: walletAddress, username }, { onConflict: 'wallet_address' })
    .select()
    .single();

  if (error) throw error;
  alert('New profile created')
  return data; // returns user row with id
}

//player state creation, player joins
export async function setPlayerState(player_name,username) {
  const { data, error } = await supabase
    .from('player_state')
    .upsert({ player_name,username, last_update: new Date().toISOString() }, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// export async function read_player_state(player) {
    
//     const { data: profileData, error: findError } = await supabase
//     .from("users")
//     .select("*")
//     .eq("player_name", walletAddress)
//     .single();

//     if (findError && findError.code !== "PGRST116") {
//         console.error("Error checking player:", findError);
//         throw new Error("Database check failed");
//     }

//     if (profileData) {
//         return profileData;
//     }
// }

//remove player state on disconnect
export async function removePlayerState(userId) {
    const {error} = await supabase.from('player_state').delete().eq('user_id', userId);
    if (error) throw error;
}

//transaction : do it later
// export async function logTransaction(userId, type, amount, currency = 'GAME', metadata = {}, tx_hash = null) {
//   const { error } = await supabase.from('transactions').insert([{
//     user_id: userId, type, amount, currency, metadata, tx_hash
//   }]);
//   if (error) throw error;
// }