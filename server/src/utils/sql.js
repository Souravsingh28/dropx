export const q = async (pool, sql, params=[]) => {
  const [rows] = await pool.query(sql, params);
  return rows;
};
