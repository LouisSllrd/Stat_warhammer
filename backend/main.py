# Adaptation du backend FastAPI à partir du code fourni
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import random
import math
import re
from scipy.stats import norm
import json
import os

# Chemin vers le fichier JSON
catalogue_path = os.path.join(os.path.dirname(__file__), 'unit_catalogue.json')

def load_unit_catalogue():
    with open(catalogue_path, 'r', encoding='utf-8') as f:
        catalogue = json.load(f)
    return catalogue

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- Simulation Functions --------------------

def D6():
    return random.randint(1, 6)

def D3():
    return math.ceil(random.randint(1, 6) / 2)

def convert(val):
    if isinstance(val, (int, float)):
        return val
    if isinstance(val, str):
        match_YD6_X = re.match(r"(\d+)\s*D6\s*\+\s*(\d+)", val)
        match_YD3_X = re.match(r"(\d+)\s*D3\s*\+\s*(\d+)", val)
        match_D6_X = re.match(r"D6\s*\+\s*(\d+)", val)
        match_D3_X = re.match(r"D3\s*\+\s*(\d+)", val)
        match_YD6 = re.match(r"(\d+)\s*D6\b", val)
        match_YD3 = re.match(r"(\d+)\s*D3\b", val)
        if match_D6_X:
            return D6() + int(match_D6_X.group(1))
        elif match_D3_X:
            return D3() + int(match_D3_X.group(1))
        elif match_YD6_X:
            return sum(D6() for _ in range(int(match_YD6_X.group(1)))) + int(match_YD6_X.group(2))
        elif match_YD3_X:
            return sum(D3() for _ in range(int(match_YD3_X.group(1)))) + int(match_YD3_X.group(2))
        elif match_YD6:
            return sum(D6() for _ in range(int(match_YD6.group(1))))
        elif match_YD3:
            return sum(D3() for _ in range(int(match_YD3.group(1))))
        elif re.fullmatch(r"\s*D6\s*", val):
            return D6()
        elif re.fullmatch(r"\s*D3\s*", val):
            return D3()
        else:
            return int(val)
    raise ValueError(f"Invalid format: {val}")

def damage_trial(params):
    # Extraction des paramètres
    Attacks = params["Attacks"]
    CT = params["CT"]
    Strength = params["Strength"]
    PA = params["PA"]
    Damage = params["Damage"]
    Sustained_hit = params["Sustained_hit"]
    Sustained_X = params["Sustained_X"]
    Lethal_hit = params["Lethal_hit"]
    Deva_wound = params["Deva_wound"]
    Blast = params["Blast"]
    Melta = params["Melta"]
    Modif_hit = params["Modif_hit"]
    Modif_wound = params["Modif_wound"]
    Auto_hit = params["Auto_hit"]
    Re_roll_hit = params["Re_roll_hit"]
    Re_roll_hit1 = params["Re_roll_hit1"]
    Re_roll_wound = params["Re_roll_wound"]
    Re_roll_wound1 = params["Re_roll_wound1"]
    Crit_on_X_to_hit = params["Crit_on_X_to_hit"]
    Crit_on_X_to_wound = params["Crit_on_X_to_wound"]
    Toughness = params["Toughness"]
    Save = params["Save"]
    Save_invu = params["Save_invu"]
    Save_invu_X = params["Save_invu_X"]
    PV = params["PV"]
    Nb_of_models = params["Nb_of_models"]
    Cover = params["Cover"]
    Fnp = params["Fnp"]
    Fnp_X = params["Fnp_X"]
    Halve_damage = params["Halve_damage"]

    Attacks = convert(Attacks)
    if Blast:
        Attacks += Nb_of_models // 5
    # Si Attacks est de type int ou float, pas besoin de le convertir.

    if Auto_hit:
        total_hits = Attacks
        letals = 0
    else :
        # On lance le jet pour toucher
        Results_hit = []
        for i in range(Attacks):
            Results_hit.append(D6())
        
        # On regarde les résultats du jet de touche
        success_hits = 0
        sustained = 0
        letals = 0
        target_hit = max(CT - Modif_hit, 2)
        for result in Results_hit:
            if result >= Crit_on_X_to_hit:
                success_hits+=1
                if Sustained_hit:
                    sustained+=convert(Sustained_X)
                if Lethal_hit:
                    letals+=1
            elif result >= target_hit :
                success_hits+=1
            elif result == 1:
                if Re_roll_hit1 or Re_roll_hit:
                    result = D6()
                    if result >= Crit_on_X_to_hit:
                        success_hits+=1
                        if Sustained_hit:
                            sustained+=convert(Sustained_X)
                        if Lethal_hit:
                            letals+=1
                    elif result >= target_hit :
                        success_hits+=1
            else :
                if Re_roll_hit:
                    result = D6()
                    if result >= Crit_on_X_to_hit:
                        success_hits+=1
                        if Sustained_hit:
                            sustained+=convert(Sustained_X)
                        if Lethal_hit:
                            letals+=1
                    elif result >= target_hit :
                        success_hits+=1
        
        total_hits = success_hits + sustained

    # On lance le jet pour blesser
    Results_wound = []
    for i in range(total_hits):
        Results_wound.append(D6())

    # On regarde les résultats du jet de blessure
    success_wounds = 0
    deva = 0
    Strength = convert(Strength)
    if Strength == Toughness:
        unmodified_target_wound = 4
    elif Strength > Toughness:
        if Strength >= 2*Toughness:
            unmodified_target_wound = 2
        else :
            unmodified_target_wound = 3
    elif Strength < Toughness :
        if Strength **2 <= Toughness:
            unmodified_target_wound = 6
        else :
            unmodified_target_wound = 5
    target_wound = max(unmodified_target_wound - Modif_wound, 2)

    for result in Results_wound:
        if result >= Crit_on_X_to_wound:
            success_wounds+=1
            if Deva_wound:
                deva+=1
        elif result >= target_wound :
            success_wounds+=1
        elif result == 1 :
            if Re_roll_wound1 or Re_roll_wound:
                result = D6()
                if result >= Crit_on_X_to_wound:
                    success_wounds+=1
                    if Deva_wound:
                        deva+=1
                elif result >= target_wound :
                    success_wounds+=1
        else :
            if Re_roll_wound:
                result = D6()
                if result >= Crit_on_X_to_wound:
                    success_wounds+=1
                    if Deva_wound:
                        deva+=1
                elif result >= target_wound :
                    success_wounds+=1

    total_wounds = success_wounds + letals
    
    # On lance les jets de sauvegarde 
    Results_svg = []
    for i in range(total_wounds):
        Results_svg.append(D6())

    # On regarde les résultats du jet de sauvegarde
    missed_svg = 0
    PA = convert(PA)
    if Cover:
        target_svg = max(Save-PA-1,2)
    else :
        target_svg = max(Save-PA,2)
    if Save_invu:
        target_svg = min(Save_invu_X,target_svg)

    for result in Results_svg:
        if result<target_svg:
            missed_svg+=1

    # On calcule le nombre de morts / le nombre de PV perdus, dépendamment s'il s'agit d'une unité avec plusieurs ou une seule figurine

    if Nb_of_models == 1:
        PV_lost = 0
        total_wounds_unsaved = missed_svg + deva
        for i in range(total_wounds_unsaved) :
            Damage = convert(Damage)
            if Halve_damage:
                Damage = math.ceil(Damage / 2)
            if Melta != 0:
                Damage += Melta
            if Fnp :
                for j in range(Damage):
                    if D6()<Fnp_X:
                        PV_lost+=1
            else :
                PV_lost += Damage
        return PV_lost
    
    else :
        models_lost = 0
        PV_remaining_on_next_model = PV
        total_wounds_unsaved = missed_svg + deva
        for i in range(total_wounds_unsaved) :
            Damage = convert(Damage)
            if Halve_damage:
                Damage = math.ceil(Damage / 2)
            if Melta != 0:
                Damage += Melta
            if Fnp: 
                for j in range(Damage):
                    if D6() < Fnp_X:
                        PV_remaining_on_next_model -= 1
            else : 
                PV_remaining_on_next_model -= Damage
            if PV_remaining_on_next_model <= 0:
                models_lost +=1
                PV_remaining_on_next_model = PV
        
        return models_lost
    
def damage_simulation(params):
    #results = [damage_trial(params) for _ in range(params["Nb_iter"])]
    results = [damage_trial(params) for _ in range(1000)]
    mean = np.mean(results)
    std = np.std(results)
    hist = dict()
    for r in results:
        hist[int(r)] = hist.get(int(r), 0) + 1
    total = len(results)
    histogram_data = [{"value": k, "frequency": v / total} for k, v in sorted(hist.items())]
    cumulative = []
    cum_sum = 0
    for val in reversed(sorted(hist)):
        cum_sum += hist[val]
        cumulative.append({"value": val, "cumulative_percent": 100 * cum_sum / total})
    if params["Nb_of_models"] == 1:
        unit_descr = "Nombre de PV perdus"
        unit = "PV"
        relative_damage = mean/params["PV"]*100
        initial_force = params["PV"]
    else : 
        unit_descr = "Nombre de figurines tuées"
        unit = "figurines"
        relative_damage = mean/params["Nb_of_models"]*100
        initial_force = params["Nb_of_models"]

    # Résultats pour des profils d'unités classiques :
    catalogue = load_unit_catalogue()
    results_catalogue = {}
    for unit_name, unit_stats in catalogue.items():
        params["Toughness"] = unit_stats["Toughness"]
        params["Save"] = unit_stats["Save"]
        params["Save_invu"] = unit_stats["Save_invu"]
        params["Save_invu_X"] = unit_stats["Save_invu_X"]
        params["PV"] = unit_stats["PV"]
        params["Nb_of_models"] = unit_stats["Nb_of_models"]
        params["Cover"] = unit_stats["Cover"]
        params["Fnp"] = unit_stats["Fnp"]
        params["Fnp_X"] = unit_stats["Fnp_X"]
        params["Halve_damage"] = unit_stats["Halve_damage"]

        results_cat = [damage_trial(params) for _ in range(1000)]
        mean_cat = np.mean(results_cat)
        std_cat = np.std(results_cat)
        if unit_stats["Nb_of_models"] == 1:
            cat_initial_force = unit_stats["PV"]
            cat_unit = "PV"
        else :
            cat_initial_force = unit_stats["Nb_of_models"]
            cat_unit = "figs"


        results_catalogue[unit_name] = {
            "mean": mean_cat,
            "std": std_cat,
            "unit": cat_unit,
            "initial_force": cat_initial_force,
            "relative_damages": mean_cat/cat_initial_force*100
        }


    return unit, unit_descr, initial_force, relative_damage, mean, std, histogram_data, list(reversed(cumulative)), results_catalogue

# -------------------- FastAPI Endpoint --------------------

class SimulationInput(BaseModel):
    Attacks: str
    CT: int
    Strength: str
    PA: str
    Damage: str
    Sustained_hit: bool
    Sustained_X: int
    Lethal_hit: bool
    Deva_wound: bool
    Blast: bool
    Melta: int
    Modif_hit: int
    Modif_wound: int
    Auto_hit: bool
    Re_roll_hit1: bool
    Re_roll_hit: bool
    Re_roll_wound1: bool
    Re_roll_wound: bool
    Crit_on_X_to_hit: int
    Crit_on_X_to_wound: int

    Toughness: int
    Save: int
    Save_invu: bool
    Save_invu_X: int
    PV: int
    Nb_of_models: int
    Cover: bool
    Fnp: bool
    Fnp_X: int
    Halve_damage: bool
    #Nb_iter: int

@app.post("/simulate")
def simulate(input: SimulationInput):
    unit, unit_descr, initial_force, relative_damages, mean, std, histogram_data, cumulative_data, results_catalogue = damage_simulation(input.dict())
    return {
        "unit": unit,
        "unit_descr": unit_descr,
        "initial_force": initial_force,
        "relative_damages": relative_damages,
        "mean": mean,
        "std": std,
        "histogram_data": histogram_data,
        "cumulative_data": cumulative_data,
        "results_catalogue": results_catalogue
    }