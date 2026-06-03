"""
Machine learning model training for Mogadishu urban growth prediction.
Uses Random Forest and Linear Regression to forecast urban expansion.

Usage:
    python train_model.py
    python train_model.py --model random_forest --target-year 2030
"""

import argparse
import json
import os
import pickle
from datetime import datetime

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

DISTRICTS = [
    "Hodan", "Wadajir", "Waberi", "Hamar Weyne", "Shangani",
    "Bondhere", "Yaaqshiid", "Daynile", "Karaan", "Heliwa",
]

DISTRICT_AREAS = [12.5, 10.8, 8.2, 4.5, 3.8, 6.1, 14.2, 18.5, 11.3, 9.7]


def generate_training_data():
    """Generate synthetic training data based on realistic urban growth patterns."""
    np.random.seed(42)
    records = []

    for d_idx, district in enumerate(DISTRICTS):
        base_area = DISTRICT_AREAS[d_idx] * (0.15 + np.random.random() * 0.1)
        base_density = 800 + np.random.random() * 400

        for year in range(2014, 2027):
            year_offset = year - 2014
            growth_factor = 1 + year_offset * 0.025 + np.random.random() * 0.015
            area = base_area * growth_factor
            density = base_density * (1 + year_offset * 0.03)
            population = int(density * DISTRICT_AREAS[d_idx])

            records.append({
                "district": district,
                "district_idx": d_idx,
                "district_area_km2": DISTRICT_AREAS[d_idx],
                "year": year,
                "built_up_area_km2": round(area, 2),
                "density_per_km2": round(density),
                "population": population,
                "year_offset": year_offset,
            })

    return pd.DataFrame(records)


def train_random_forest(df: pd.DataFrame):
    """Train Random Forest model for built-up area prediction."""
    features = ["district_idx", "district_area_km2", "year", "year_offset",
                "density_per_km2", "population"]
    X = df[features]
    y = df["built_up_area_km2"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"Random Forest — MAE: {mae:.3f}, R²: {r2:.3f}")
    return model, {"mae": mae, "r2": r2, "model": "random_forest"}


def train_linear_regression(df: pd.DataFrame):
    """Train Linear Regression model for built-up area prediction."""
    features = ["district_idx", "district_area_km2", "year", "year_offset",
                "density_per_km2", "population"]
    X = df[features]
    y = df["built_up_area_km2"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = LinearRegression()
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"Linear Regression — MAE: {mae:.3f}, R²: {r2:.3f}")
    return model, {"mae": mae, "r2": r2, "model": "linear_regression"}


def predict_future(model, df: pd.DataFrame, target_years: list):
    """Generate predictions for future years."""
    predictions = []
    latest = df[df["year"] == df["year"].max()]

    for target_year in target_years:
        year_offset = target_year - 2014
        for _, row in latest.iterrows():
            growth_rate = 1 + (target_year - 2026) * 0.04
            features = pd.DataFrame([{
                "district_idx": row["district_idx"],
                "district_area_km2": row["district_area_km2"],
                "year": target_year,
                "year_offset": year_offset,
                "density_per_km2": row["density_per_km2"] * growth_rate,
                "population": int(row["population"] * growth_rate),
            }])

            predicted_area = model.predict(features)[0]
            confidence = min(0.95, 0.75 + (2026 - target_year + 4) * 0.02)

            predictions.append({
                "district": row["district"],
                "target_year": target_year,
                "predicted_area_km2": round(float(predicted_area), 2),
                "predicted_density": round(float(row["density_per_km2"] * growth_rate)),
                "confidence_score": round(confidence, 4),
            })

    return predictions


def main():
    parser = argparse.ArgumentParser(description="Train urban growth prediction models")
    parser.add_argument("--model", choices=["random_forest", "linear_regression", "both"],
                        default="both")
    parser.add_argument("--target-year", type=int, nargs="+", default=[2027, 2028, 2029, 2030])
    parser.add_argument("--output-dir", type=str, default="models")
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)

    print("Generating training data...")
    df = generate_training_data()
    print(f"Training dataset: {len(df)} records, {df['district'].nunique()} districts")

    results = {"training_date": datetime.now().isoformat(), "models": {}, "predictions": {}}

    if args.model in ("random_forest", "both"):
        print("\nTraining Random Forest...")
        rf_model, rf_metrics = train_random_forest(df)
        with open(os.path.join(args.output_dir, "random_forest.pkl"), "wb") as f:
            pickle.dump(rf_model, f)
        results["models"]["random_forest"] = rf_metrics
        results["predictions"]["random_forest"] = predict_future(rf_model, df, args.target_year)

    if args.model in ("linear_regression", "both"):
        print("\nTraining Linear Regression...")
        lr_model, lr_metrics = train_linear_regression(df)
        with open(os.path.join(args.output_dir, "linear_regression.pkl"), "wb") as f:
            pickle.dump(lr_model, f)
        results["models"]["linear_regression"] = lr_metrics
        results["predictions"]["linear_regression"] = predict_future(lr_model, df, args.target_year)

    output_file = os.path.join(args.output_dir, "training_results.json")
    with open(output_file, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nModels saved to {args.output_dir}/")
    print(f"Results saved to {output_file}")


if __name__ == "__main__":
    main()
