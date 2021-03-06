import blacklist from "./blacklist.json";
import { getModel } from "./mongo";

export const PROFILE_SUBGRAPH = "https://api.thegraph.com/subgraphs/name/pancakeswap/profile";

const TRADING_COMP_URL_PREFIX =
  "https://api.thegraph.com/subgraphs/name/pancakeswap/trading-competition-";

export const getTradingCompSubgraph = (id: string): string => {
  switch (id) {
    case "1":
      return TRADING_COMP_URL_PREFIX + "v1";
    case "2":
      return TRADING_COMP_URL_PREFIX + "v2";
    case "3":
      return TRADING_COMP_URL_PREFIX + "v3";
    case "test":
      return process.env.TEST_TRADING_COMP_URL || TRADING_COMP_URL_PREFIX + "v2";
    default:
      return TRADING_COMP_URL_PREFIX + "v2";
  }
};

export const getTradingCompId = (competitionID: string | string[]): string => {
  competitionID = competitionID as string;
  if (["test", "1", "2", "3"].includes(competitionID)) {
    return competitionID;
  }
  return "2";
};

export const getRewardGroup = (competitionID: string | string[]): string => {
  competitionID = competitionID as string;
  if (["1", "2", "3", "4"].includes(competitionID)) {
    return competitionID;
  }
  return "4";
};

export const getRewardGroupTitle = (competitionID: string): string | undefined => {
  competitionID = competitionID as string;
  switch (competitionID) {
    case "1":
      return "1 - Purple";
    case "2":
      return "2 - Bronze";
    case "3":
      return "3 - Silver";
    case "4":
      return "4 - Gold";
  }
};

export const getLeaderboardKey = (competitionID: string): string => {
  switch (competitionID) {
    case "1":
      return "leaderboard";
    case "2":
      return "leaderboard_fantoken";
    case "3":
      return "leaderboard_mobox";
    case "test":
      return "leaderboard_test";
    default:
      return "leaderboard_fantoken";
  }
};

/**
 * Check for the validity of a username based on rules (see documentation).
 *
 * @see https://github.com/pancakeswap/pancake-profile/blob/master/user-stories.md#step-4-username-creation
 *
 * @param {string} username
 * @returns {Promise<{ valid: boolean; message?: string }>}
 */
export const isValid = async (username: string): Promise<{ valid: boolean; message?: string }> => {
  // Check if the username is set to avoid unhandled rejection.
  if (!username) {
    return {
      valid: false,
      message: "Minimum length: 3 characters",
    };
  }

  // Cannot use a username of less than 3 characters
  if (username.length < 3) {
    return {
      valid: false,
      message: "Minimum length: 3 characters",
    };
  }

  // Cannot use a username of more than 15 characters
  if (username.length > 15) {
    return {
      valid: false,
      message: "Maximum length: 15 characters",
    };
  }

  // Can only use alphanumeric characters
  // Cannot use a space in their username
  if (!username.match(/^[a-zA-Z0-9]+$/i)) {
    return {
      valid: false,
      message: "No spaces or special characters",
    };
  }

  // Cannot create a username which violates blacklist
  if (username.toLowerCase().match(blacklist.join("|"))) {
    return {
      valid: false,
      message: "Username not allowed",
    };
  }

  // Cannot have the same username as another user (Case insensitive)
  const userModel = await getModel("User");
  if (await userModel.exists({ slug: username.toLowerCase() })) {
    return {
      valid: false,
      message: "Username taken",
    };
  }

  return {
    valid: true,
  };
};
