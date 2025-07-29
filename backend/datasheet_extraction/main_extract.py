import os
import json
import requests
from lxml import etree
import re

def get_base_unit_name(name):
    """
    Extrait le nom de base de l’unité en supprimant les suffixes 'with ...' ou 'w/ ...'
    """
    return re.split(r"\s+(with|w/)\s+", name, flags=re.IGNORECASE)[0].strip()


NS = {"bs": "http://www.battlescribe.net/schema/catalogueSchema"}
GITHUB_API_URL = "https://api.github.com/repos/BSData/wh40k-10e/contents"
GITHUB_RAW_BASE = "https://raw.githubusercontent.com/BSData/wh40k-10e/main"
OUTPUT_FOLDER = "output"

def extract_profiles_recursive(element):
    profiles_data = {}

    for profile in element.findall(".//bs:profile", namespaces=NS):
        profile_name = profile.get("name")
        profile_type = profile.get("typeName")

        characteristics = {
            char.get("name"): char.text
            for char in profile.findall(".//bs:characteristic", namespaces=NS)
        }

        profiles_data.setdefault(profile_type, []).append({
            "name": profile_name,
            "characteristics": characteristics
        })

    return profiles_data


def merge_profiles(base, additional):
    for profile_type, new_profiles in additional.items():
        if profile_type not in base:
            base[profile_type] = new_profiles
        else:
            existing = base[profile_type]
            existing_keys = {(p["name"], profile_type) for p in existing}
            for p in new_profiles:
                key = (p["name"], profile_type)
                if key not in existing_keys:
                    existing.append(p)
                    existing_keys.add(key)

def extract_unit_data(entry):
    unit_name = entry.get("name")
    unit_data = {
        "cost": {},
        "profiles": {}
    }
    for cost in entry.findall(".//bs:cost", namespaces=NS):
        name = cost.get("name")
        value = cost.get("value")
        if name and value:
            unit_data["cost"][name] = value
    unit_profiles = extract_profiles_recursive(entry)

    child_entries = entry.findall(".//bs:selectionEntry", namespaces=NS)

    for child in child_entries:
        child_profiles = extract_profiles_recursive(child)

        merge_profiles(unit_profiles, child_profiles)
    unit_data["profiles"] = unit_profiles
    return unit_name, unit_data

def extract_units_from_content(cat_content_bytes):
    try:
        tree = etree.fromstring(cat_content_bytes)
    except etree.XMLSyntaxError:
        print("[❌] Erreur de parsing du contenu XML")
        return {}

    unit_groups = {}

    for entry in tree.findall(".//bs:selectionEntry", namespaces=NS):
        if entry.get("type") == "model":
            name, data = extract_unit_data(entry)
            if not name:
                continue

            base_name = get_base_unit_name(name)
            if base_name not in unit_groups:
                unit_groups[base_name] = {
                    "cost": {},
                    "profiles": {}
                }

            # Merge costs
            unit_groups[base_name]["cost"].update(data["cost"])

            # Merge profiles
            merge_profiles(unit_groups[base_name]["profiles"], data["profiles"])

    print(f"[✅] {len(unit_groups)} unités fusionnées depuis le contenu")
    return unit_groups


def list_cat_files(path=""):
    """Liste tous les fichiers .cat dans le repo (non récursif pour l'instant)"""
    url = f"{GITHUB_API_URL}/{path}" if path else GITHUB_API_URL
    response = requests.get(url)
    if response.status_code != 200:
        print(f"[❌] Impossible de lister les fichiers : statut {response.status_code}")
        return []

    files = response.json()
    cat_files = []
    for f in files:
        if f["type"] == "file" and f["name"].endswith(".cat"):
            cat_files.append(f["path"])
        # Optionnel: gérer sous-dossiers récursifs ici si besoin
    return cat_files

def download_file(file_path):
    raw_url = f"{GITHUB_RAW_BASE}/{file_path}"
    response = requests.get(raw_url)
    if response.status_code != 200:
        print(f"[❌] Échec téléchargement {file_path}: statut {response.status_code}")
        return None
    return response.content

def main():
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)

    print("[⏳] Liste des fichiers .cat sur GitHub...")
    cat_files = list_cat_files()

    if not cat_files:
        print("[⚠️] Aucun fichier .cat trouvé.")
        return

    print(f"[ℹ️] {len(cat_files)} fichiers .cat trouvés.")

    for cat_file in cat_files:
        print(f"\n[⏳] Traitement de {cat_file} ...")
        content = download_file(cat_file)
        if content is None:
            continue

        units = extract_units_from_content(content)
        if not units:
            print(f"[⚠️] Aucunité extraite pour {cat_file}")
            continue

        json_path = os.path.join(OUTPUT_FOLDER, f"{os.path.splitext(os.path.basename(cat_file))[0]}.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(units, f, indent=2, ensure_ascii=False)

        print(f"[💾] Sauvegardé dans {json_path}")

if __name__ == "__main__":
    main()
