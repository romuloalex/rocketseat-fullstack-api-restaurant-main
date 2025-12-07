import { knex as knexconfig } from "knex";

import config from "../../knexfile";

export const knex = knexconfig(config);
