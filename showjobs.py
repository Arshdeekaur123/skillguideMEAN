import pickle
import os

BASE_DIR = os.path.join(os.path.dirname(__file__), "backend")

df = pickle.load(open(os.path.join(BASE_DIR, "data.pkl"), "rb"))

df.columns = df.columns.str.replace('ï»¿', '', regex=False)
df.columns = df.columns.str.replace('\ufeff', '', regex=False)
df.columns = df.columns.str.strip()
df.columns = df.columns.str.lower()

all_jobs = df['job_position_name'].dropna().unique()

for j in all_jobs:
    print(j)