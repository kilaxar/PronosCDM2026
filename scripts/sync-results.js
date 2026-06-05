const admin = require("firebase-admin");

// Initialize Firebase Admin SDK with credentials
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function syncResults() {
  try {
    const token = process.env.FOOTBALL_DATA_TOKEN;
    if (!token) throw new Error("Token API manquant");

    const resp = await fetch(
      "https://api.football-data.org/v4/competitions/WC/matches?season=2026",
      {
        headers: { "X-Auth-Token": token },
      }
    );
    if (!resp.ok) throw new Error(`API Error ${resp.status}`);
    const data = await resp.json();

    // Mettre à jour les matchs terminés
    const finished = (data.matches || []).filter(
      (m) => m.status === "FINISHED"
    );
    for (const apim of finished) {
      const snap = await db
        .collection("matches")
        .where("status", "!=", "finished")
        .get();
      for (const d of snap.docs) {
        const local = d.data();
        const apiHome = apim.homeTeam?.name || "";
        const apiAway = apim.awayTeam?.name || "";

        const homeMatch =
          apiHome.toLowerCase().includes(local.h.toLowerCase().slice(0, 5)) ||
          local.h.toLowerCase().includes(apiHome.toLowerCase().slice(0, 5));
        const awayMatch =
          apiAway.toLowerCase().includes(local.a.toLowerCase().slice(0, 5)) ||
          local.a.toLowerCase().includes(apiAway.toLowerCase().slice(0, 5));

        if (homeMatch && awayMatch) {
          await d.ref.update({
            status: "finished",
            homeScore: apim.score?.fullTime?.home ?? 0,
            awayScore: apim.score?.fullTime?.away ?? 0,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          break;
        }
      }
    }

    // Mettre à jour les matchs éliminatoires
    const stageMap = {
      LAST_32: "Seizièmes",
      LAST_16: "Huitièmes",
      QUARTER_FINALS: "Quarts",
      SEMI_FINALS: "Demi-finales",
      THIRD_PLACE: "3ème Place",
      FINAL: "Finale",
    };
    const knockouts = (data.matches || []).filter(
      (m) => stageMap[m.stage] && m.homeTeam?.name && m.awayTeam?.name
    );

    const batch = db.batch();
    const existSnap = await db.collection("matches").get();
    const existExtIds = new Set(
      existSnap.docs
        .map((d) => d.data().externalId)
        .filter(Boolean)
    );

    for (const apim of knockouts) {
      if (!existExtIds.has(String(apim.id))) {
        const ref = db.collection("matches").doc();
        batch.set(ref, {
          externalId: String(apim.id),
          h: apim.homeTeam.name,
          a: apim.awayTeam.name,
          stage: stageMap[apim.stage],
          status: apim.status === "FINISHED" ? "finished" : "pending",
          homeScore: apim.score?.fullTime?.home ?? null,
          awayScore: apim.score?.fullTime?.away ?? null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
    await batch.commit();

    console.log(
      `✅ Sync completed: ${finished.length} finished, ${knockouts.length} knockouts`
    );
  } catch (error) {
    console.error("❌ Sync failed:", error.message);
    process.exit(1);
  }
}

syncResults();
