const FirebaseConfig = require("./FirebaseConfig");
const functions = FirebaseConfig.functions;
const firestore = FirebaseConfig.firestore;
const storageBucket = FirebaseConfig.storageBucket;
const admin = FirebaseConfig.admin;

exports.onCreateRecipe = functions.firestore
  .document("recipes/{recipeId}")
  .onCreate(async (snapshot) => {
    functions.logger.log(JSON.stringify(functions.config()));
    const countDocRef = firestore.collection("recipeCounts").doc("all");
    const countDoc = await countDocRef.get();

    if (countDoc.exists) {
      countDocRef.update({ count: admin.firestore.FieldValue.increment(1) });
    } else {
      countDocRef.set({ count: 1 });
    }

    const recipe = snapshot.data();

    if (recipe.isPublished) {
      const counPublishedRef = firestore
        .collection("recipeCounts")
        .doc("piblished");
      const counPublished = await counPublishedRef.get();

      if (counPublished.exists) {
        counPublishedRef.update({
          count: admin.firestore.FieldValue.increment(1),
        });
      } else {
        counPublishedRef.set({ count: 1 });
      }
    }
  });
