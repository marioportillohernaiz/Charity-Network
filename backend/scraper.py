# This script scrapes a website for its title, description, phone number, email address, and opening hours.
# It uses BeautifulSoup for HTML parsing and regex for pattern matching.

# NOT IN USE due to website restrictions on scraping (e.g. bot protection, rate-limiting, or terms of service) 

import requests
from bs4 import BeautifulSoup
import spacy
import re
import json

nlp = spacy.load("en_core_web_sm")

def scrape_website(url):
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        title = ""
        if (title_meta := soup.find("meta", {"property": "og:site_name"})) or \
           (title_meta := soup.find("meta", {"property": "og:title"})):
            title = title_meta.get("content", "").strip()
        elif soup.title:
            title = soup.title.string.strip()

        description = ""
        if description_meta := soup.find("meta", {"name": "description"}):
            description = description_meta.get("content", "").strip()

        phone = ""
        phone_elements = soup.select("a[href^='tel:']")
        if phone_elements:
            phone = phone_elements[0].get_text(strip=True)
        else:
            phone_match = re.search(r"\+?\d{1,4}[\s\-]?\(?\d{2,4}\)?[\s\-]?\d{2,4}[\s\-]?\d{2,9}|\d{4}[\s]?\d{6}", soup.text)
            if phone_match:
                phone = phone_match.group().replace(" ", "").strip()

        email = ""
        email_elements = soup.select("a[href^='mailto:']")
        if email_elements:
            email = email_elements[0].get_text(strip=True)
        else:
            email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", soup.text)
            if email_match:
                email = email_match.group().strip()

        opening_hours = ""

        json_ld_scripts = soup.find_all("script", type="application/ld+json")
        for script in json_ld_scripts:
            try:
                json_data = json.loads(script.string)
                if isinstance(json_data, dict) and "openingHours" in json_data:
                    opening_hours = json_data["openingHours"]
                    break
                elif isinstance(json_data, dict) and "openingHoursSpecification" in json_data:
                    opening_hours_list = json_data["openingHoursSpecification"]
                    if isinstance(opening_hours_list, list):
                        opening_hours = "\n".join([
                            f"{entry.get('dayOfWeek', 'Unknown')}: {entry.get('opens', '')} - {entry.get('closes', '')}"
                            for entry in opening_hours_list
                        ])
                        break
            except (json.JSONDecodeError, TypeError):
                continue

        if not opening_hours:
            potential_classes = ["hours", "opening-hours", "business-hours", "operating-hours"]
            for class_name in potential_classes:
                hours_element = soup.find(class_=class_name)
                if hours_element:
                    opening_hours = hours_element.get_text(strip=True)
                    break

        if not opening_hours:
            regex_patterns = [
                r"Monday.*?Sunday.*?\d{1,2}:\d{2}\s?(AM|PM)?.*?\d{1,2}:\d{2}\s?(AM|PM)?",
                r"Mon.*?Fri.*?\d{1,2}:\d{2}\s?(AM|PM)?.*?\d{1,2}:\d{2}\s?(AM|PM)?",
                r"\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\s*[:-]?\s*\d{1,2}:\d{2}\s*(AM|PM)?\s*-\s*\d{1,2}:\d{2}\s*(AM|PM)?"
            ]
            for pattern in regex_patterns:
                match = re.search(pattern, soup.text, re.IGNORECASE | re.DOTALL)
                if match:
                    opening_hours = match.group().strip()
                    break

        return {
            "title": title,
            "description": description,
            "phone": phone,
            "email": email,
            "opening_hours": opening_hours
        }

    except requests.exceptions.RequestException as e:
        return {"error": str(e)}