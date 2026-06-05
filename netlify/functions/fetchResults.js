exports.handler = async (event) => {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Token API non configuré' }) };
  }

  try {
    const resp = await fetch('https://api.football-data.org/v4/competitions/WC/matches?season=2026', {
      headers: { 'X-Auth-Token': token }
    });

    if (!resp.ok) throw new Error(`API Error ${resp.status}`);
    const data = await resp.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
