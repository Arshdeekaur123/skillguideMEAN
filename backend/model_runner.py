import os
import pickle
import sys
import json
import pandas as pd
import re

BASE_DIR = os.path.dirname(__file__)

# load trained files
model = pickle.load(open(os.path.join(BASE_DIR, "model.pkl"), "rb"))
vectorizer = pickle.load(open(os.path.join(BASE_DIR, "vectorizer.pkl"), "rb"))
df = pickle.load(open(os.path.join(BASE_DIR, "data.pkl"), "rb"))

# clean weird columns
df.columns = df.columns.str.replace('ï»¿', '', regex=False)
df.columns = df.columns.str.replace('\ufeff', '', regex=False)
df.columns = df.columns.str.strip()
df.columns = df.columns.str.lower()

# receive user text
user_text = sys.argv[1].lower().strip()

# make user skills list
user_skills = [x.strip().lower() for x in re.split(r'[,\s]+', user_text) if x.strip() != ""]
user_skills = list(set(user_skills))

results = []

for i, row in df.iterrows():

    job_name = str(row['job_position_name']).strip()

    job_required = str(row['skills_required']).lower()

    if job_required == "nan" or job_required.strip() == "":
        job_required = str(row['responsibilities.1']).lower()

    # ML prediction using trained model
    combined = user_text + " " + job_required
    vec = vectorizer.transform([combined])
    score = float(model.predict(vec)[0])

    # extract job skills words
    job_words = re.split(r'[,.\n\r\t ()/-]+', job_required)
    job_words = [w.strip().lower() for w in job_words if len(w.strip()) > 2]

    # remove duplicate words
    job_words = list(dict.fromkeys(job_words))

    # matched skills
    matched = []
    for us in user_skills:
        for js in job_words:
            if us in js or js in us:
                matched.append(js)

    matched = list(set(matched))

    # missing skills
    missing = [x for x in job_words if x not in matched]

    # match percent based on required job skills
    percent = round((len(matched) / len(job_words)) * 100) if len(job_words) > 0 else 0

    results.append({
        "job": job_name,
        "score": round(score * 100),
        "percent": percent,
        "job_skills": job_words[:10],
        "matched_skills": matched,
        "missing": missing[:8]
    })

# sort by ML score
results = sorted(results, key=lambda x: x["score"], reverse=True)

# unique top 3 jobs
top3 = []
seen = set()

for item in results:
    if item["job"] not in seen:
        top3.append(item)
        seen.add(item["job"])
    if len(top3) == 3:
        break

print(json.dumps(top3))