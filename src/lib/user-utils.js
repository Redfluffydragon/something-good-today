import dayjs from "dayjs";
import { get } from "svelte/store";
import { user } from "./stores";

export function addToHistory() {
  if (dayjs().isAfter(get(user).lastUpdated, 'day')) {
    user.update(user => {
      // Use unshift for reverse chronological order
      user.history.unshift({
        date: user.lastUpdated,
        projects: user.today,
        goal: user.goal,
      });

      user.today = [];
      user.lastUpdated = Date.now();

      return user;
    });
  }
}
