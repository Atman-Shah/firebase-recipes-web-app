const FirebaseConfig = require("./FirebaseConfig");
const functions = FirebaseConfig.functions;
const firestore = FirebaseConfig.firestore;
const storageBucket = FirebaseConfig.storageBucket;
const admin = FirebaseConfig.admin;

exports.onCreateRecipe = functions.firestore
  .document("recipes/{recipeId}")
  .onCreate(async (snapshot) => {
    // functions.logger.log(JSON.stringify(functions.config()));
    const countDocRef = firestore.collection("recipeCounts").doc("all");
    const countDoc = await countDocRef.get();

    if (countDoc.exists) {
      countDocRef.update({ count: admin.firestore.FieldValue.increment(1) });
    } else {
      countDocRef.set({ count: 1 });
    }

    const recipe = snapshot.data();

    if (recipe.isPublished) {
      const countPublishedRef = firestore
        .collection("recipeCounts")
        .doc("published");
      const counPublished = await countPublishedRef.get();

      if (counPublished.exists) {
        countPublishedRef.update({
          count: admin.firestore.FieldValue.increment(1),
        });
      } else {
        countPublishedRef.set({ count: 1 });
      }
    }
  });

exports.onDeleteRecipe = functions.firestore
  .document("recipes/{recipeId}")
  .onDelete(async (snapshot) => {
    const recipe = snapshot.data();
    const imageUrl = recipe.imageUrl;

    if (imageUrl) {
      const decodedUrl = decodeURIComponent(imageUrl);
      const startIndex = decodedUrl.indexOf("/o/") + 3;
      const endIndex = decodedUrl.indexOf("?");
      const fullFilePath = decodedUrl.substring(startIndex, endIndex);
      const file = storageBucket.file(fullFilePath);

      console.log(`Attempting to delete: ${fullFilePath}`);

      try {
        await file.delete();
        console.log("we have successfully deleted image.");
      } catch (error) {
        console.log(`Failed to delete file : ${error.message}`);
      }
    }

    const countDocRef = firestore.collection("recipeCounts").doc("all");
    const countDoc = await countDocRef.get();

    if (countDoc.exists) {
      countDocRef.update({ count: admin.firestore.FieldValue.increment(-1) });
    } else {
      countDocRef.set({ count: 0 });
    }

    if (recipe.isPublished) {
      const countPublishedRef = firestore
        .collection("recipeCounts")
        .doc("published");
      const countPublished = await countPublishedRef.get();

      if (countPublished.exists) {
        countPublishedRef.update({
          count: admin.firestore.FieldValue.increment(-1),
        });
      } else {
        countPublishedRef.set({ count: 0 });
      }
    }
  });
