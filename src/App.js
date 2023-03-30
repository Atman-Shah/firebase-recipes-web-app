import { useEffect, useState } from "react";
import FirebaseAuthService from "./FirebaseAuthService";
import LoginForm from "./components/LoginForm";
import AddEditRecipeForm from "./components/AddEditRecipeForm";

import "./App.css";
import FirebaseFirestoreService from "./FirebaseFirestoreService";

function App() {
  const [user, setUser] = useState(null);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [orderBy, setOrderBy] = useState("publishDateDesc");

  useEffect(() => {
    setIsLoading(true);

    fetchRecipes()
      .then((fetchedRecipes) => {
        setRecipes(fetchedRecipes);
      })
      .catch((error) => {
        console.error(error.message);
        throw error;
      })
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, categoryFilter, orderBy]);

  FirebaseAuthService.subscribeToAuthChanges(setUser);

  async function fetchRecipes() {
    const queries = [];

    if (categoryFilter) {
      queries.push({
        field: "category",
        condition: "==",
        value: categoryFilter,
      });
    }

    if (!user) {
      queries.push({
        field: "isPublished",
        condition: "==",
        value: true,
      });
    }

    const orderByField = "publishDate";
    let orderByDirection;

    if (orderBy) {
      switch (orderBy) {
        case "publishDateAsc":
          orderByDirection = "asc";
          break;
        case "publishDateDesc":
          orderByDirection = "desc";
          break;
        default:
          break;
      }
    }

    let fetchedRecipes = [];

    try {
      const response = await FirebaseFirestoreService.readDocuments({
        collection: "recipes",
        queries: queries,
        orderByField: orderByField,
        orderByDirection: orderByDirection,
      });

      const newRecipes = response.docs.map((recipeDoc) => {
        const id = recipeDoc.id;
        const data = recipeDoc.data();
        data.publishDate = new Date(data.publishDate.seconds * 1000);

        return { ...data, id };
      });

      fetchedRecipes = [...newRecipes];
    } catch (error) {
      console.eroor(error.message);
      throw error;
    }

    return fetchedRecipes;
  }

  async function handleFetchRecipes() {
    try {
      const fetchedRecipes = await fetchRecipes();

      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  async function handleAddRecipe(newRecipe) {
    try {
      const response = await FirebaseFirestoreService.createDocument(
        "recipes",
        newRecipe
      );

      //TODO: fetch new recipes from firestore
      handleFetchRecipes();

      alert(`successfully created a recipe with an ID = ${response.id}`);
    } catch (error) {
      alert(error.message);
      throw error;
    }
  }

  async function handleUpdateRecipe(newRecipe, recipeId) {
    try {
      await FirebaseFirestoreService.updateDocument(
        "recipes",
        recipeId,
        newRecipe
      );

      handleFetchRecipes();

      alert(`successfully updated a recipe with an ID: ${recipeId}`);
      setCurrentRecipe(null);
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleDeleteRecipe(recipeId) {
    const deleteConfirmation = window.confirm(
      "Are you sure you want to delete this recipe? Click OK for Yes and Cancel for No."
    );

    if (deleteConfirmation) {
      try {
        await FirebaseFirestoreService.deleteDocument("recipes", recipeId);

        handleFetchRecipes();

        setCurrentRecipe(null);

        window.scrollTo(0, 0);

        alert(`successfully deleted a recipe with an ID = ${recipeId}`);
      } catch (error) {
        alert(error.message);
        throw error;
      }
    }
  }

  function handleEditRecipeClick(recipeId) {
    const selectedRecipe = recipes.find((recipe) => {
      return recipe.id === recipeId;
    });

    if (selectedRecipe) {
      setCurrentRecipe(selectedRecipe);
      window.scrollTo(0, document.body.scrollHeight);
    }
  }

  function handleEditRecipeCancel() {
    setCurrentRecipe(null);
  }

  function lookupCategoryLabel(categoryKey) {
    const categories = {
      breadsSandwitchesAndPizza: "Breads, Sandwitches and Pizza",
      breakfast: "Breakfast",
      dessertsAndBakedGoods: "Desserts & Baked Goods",
      indianFood: "Indian Food",
      vegetables: "Vegetables",
    };

    // We can't write categories.categoryKey because categoryKey will a string (e.g vegetables)
    // this is how we overcome this by writing it this way
    const label = categories[categoryKey];

    return label;
  }

  function formatDate(date) {
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getFullYear();
    const dateString = `${day}-${month}-${year}`;

    return dateString;
  }

  return (
    <div className="App">
      <div className="title-row">
        <h1 className="title">Firebase Recipes</h1>
        <LoginForm existingUser={user}></LoginForm>
      </div>
      <div className="main">
        <div className="row filters">
          <label className="recipe-label input-label">
            Category:
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="select"
              required
            >
              <option value=""></option>
              <option value="breadsSandwitchesAndPizza">
                Breads, Sandwitches and Pizza
              </option>
              <option value="breakfast">Breakfast</option>
              <option value="dessertsAndBakedGoods">
                Desserts & Baked Goods
              </option>
              <option value="indianFood">Indian Food</option>
              <option value="vegetables">Vegetables</option>
            </select>
          </label>

          <label className="input-label">
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              className="select"
            >
              <option value="publishDateDesc">
                Publish Date (newest - oldest)
              </option>
              <option value="publishDateAsc">
                Publish Date (oldest - newest)
              </option>
            </select>
          </label>
        </div>
        <div className="center">
          <div className="recipe-list-box">
            {isLoading ? (
              <div className="fire">
                <div className="flames">
                  <div className="flame"></div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                </div>
                <div className="logs"></div>
              </div>
            ) : null}
            {!isLoading && recipes && recipes.length === 0 ? (
              <h5 className="no-recipes">No Recipes Found</h5>
            ) : null}
            {!isLoading && recipes && recipes.length > 0 ? (
              <div className="recipe-list">
                {recipes.map((recipe) => {
                  return (
                    <div className="recipe-card" key={recipe.id}>
                      {recipe.isPublished === false ? (
                        <div className="unpublished">UNPUBLISHED</div>
                      ) : null}
                      <div className="recipe-name">{recipe.name}</div>
                      <div className="recipe-field">
                        Category: {lookupCategoryLabel(recipe.category)}
                      </div>
                      <div className="recipe-field">
                        Publish Date: {formatDate(recipe.publishDate)}
                      </div>
                      {user ? (
                        <button
                          type="button"
                          onClick={() => {
                            handleEditRecipeClick(recipe.id);
                          }}
                          className="primary-button edit-button"
                        >
                          Edit
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
        {user ? (
          <AddEditRecipeForm
            exhistingRecipe={currentRecipe}
            handleAddRecipe={handleAddRecipe}
            handleDeleteRecipe={handleDeleteRecipe}
            handleUpdateRecipe={handleUpdateRecipe}
            handleEditRecipeCancel={handleEditRecipeCancel}
          ></AddEditRecipeForm>
        ) : null}
      </div>
    </div>
  );
}

export default App;
