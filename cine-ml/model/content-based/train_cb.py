import os, re, pickle, pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def load_data():
    load_dotenv()

    try:
        connection_string = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_DATABASE')}"
        engine = create_engine(connection_string)
        print("Kết nối CSDL thành công!")
    except Exception as e:
        print(f"Không thể kết nối CSDL. Lỗi: {e}")
        return None
    
    sql_movies = "SELECT id, title FROM Movies"
    sql_genres = "SELECT movie_id, STRING_AGG(G.name, ', ') AS genres FROM Movie_Genres MG JOIN Genres G ON MG.genre_id = G.id GROUP BY MG.movie_id"

    try:
        print("Loading data ...")
        df_movies = pd.read_sql(sql_movies, engine)
        df_genres = pd.read_sql(sql_genres, engine)

        df_full = pd.merge(df_movies, df_genres, left_on='id', right_on='movie_id', how='left')
        df_full = df_full.drop(columns=['movie_id'])
        print("Data loaded successfully!")
        return df_full
    except Exception as e:
        print(f"Error loading data: {e}")
        return None
    
def clean_text(text):
    if text is None:
        return ""
    names = [re.sub(r'\s+', '', name).lower() for name in text.split(', ')]
    return " ".join(names)

def create_soup(data_row):
    genres = clean_text(data_row['genres'])
    return f"{genres}"

def train_model(df_full):
    df_full['genres'] = df_full['genres'].fillna('')
    df_full['soup'] = df_full.apply(create_soup, axis=1)

    print("Successfully!")

    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df_full['soup'])

    print("TF-IDF matrix shape:", tfidf_matrix.shape)

    output_dir = os.path.dirname(__file__)  # .../cine-ml/model/content-based
    os.makedirs(output_dir, exist_ok=True)

    tfidf_path = os.path.join(output_dir, "tfidf_matrix.pkl")
    pickle.dump(tfidf_matrix, open(tfidf_path, "wb"))
    print("TF-IDF matrix saved successfully!")

    movie_data = df_full[['id', 'title']]
    movie_data_path = os.path.join(output_dir, "movie_data.pkl")
    pickle.dump(movie_data, open(movie_data_path, "wb"))
    print("Movie data saved successfully!")
    return 

if __name__ == "__main__":
    df_full = load_data()
    train_model(df_full)

