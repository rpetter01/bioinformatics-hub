import time
import json
import datetime
import os
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
# Add these imports for MongoDB
import pymongo
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
def get_mongodb_connection():
    """Connect to MongoDB database"""
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/bioinformatics_hub")
    client = pymongo.MongoClient(mongo_uri)
    db = client.get_database()
    return db

def setup_driver():
    """Set up a Chrome WebDriver with standard options"""
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    # Add user agent to reduce chance of being blocked
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    return webdriver.Chrome(options=options)

def scrape_arc_jobs(limit=20):
    """Scrape bioinformatics jobs from Arc.dev"""
    url = "https://arc.dev/remote-jobs/bioinformatics"
    
    driver = setup_driver()
    print(f"Opening {url}...")
    driver.get(url)
    
    # Use WebDriverWait for more reliable loading
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-testid='job-card']"))
        )
    except:
        # Try alternative selector if the first one doesn't work
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-testid='JobListItem']"))
            )
        except Exception as e:
            print(f"Timeout waiting for page to load: {e}")
            driver.quit()
            return []
    
    # Try both selectors from your scripts
    job_cards = driver.find_elements(By.CSS_SELECTOR, "div[data-testid='job-card']")
    if not job_cards:
        job_cards = driver.find_elements(By.CSS_SELECTOR, "div[data-testid='JobListItem']")
    
    jobs = []
    for card in job_cards[:limit]:
        try:
            # Try different selectors based on your two scripts
            try:
                title = card.find_element(By.CSS_SELECTOR, "a.job-title").text.strip()
            except:
                try:
                    title = card.find_element(By.TAG_NAME, "h3").text.strip()
                except:
                    # If title can't be found, use a placeholder
                    title = "Bioinformatics Position"
                
            try:
                company = card.find_element(By.CSS_SELECTOR, "div.company-name").text.strip()
            except:
                try:
                    company = card.find_element(By.CSS_SELECTOR, "div span span").text.strip()
                except:
                    company = "Unknown Company"
            
            # Get tags using both methods
            tags = [el.text.strip() for el in card.find_elements(By.CSS_SELECTOR, "span[class*='Tag']")]
            if not tags:
                tags = ["Bioinformatics"]
            
            # Try both link selectors
            try:
                link = card.find_element(By.CSS_SELECTOR, "a.job-title").get_attribute("href")
            except:
                try:
                    link = card.find_element(By.TAG_NAME, "a").get_attribute("href")
                except:
                    # Skip jobs without links
                    continue
            
            # Add date scraped for freshness tracking
            date_scraped = datetime.datetime.now().strftime("%Y-%m-%d")
            
            jobs.append({
                "title": title,
                "company": company,
                "tags": tags,
                "location": "Remote",
                "url": link,
                "source": "Arc.dev",
                "date_scraped": date_scraped,
                "jobType": "Remote",  # Added for our MongoDB schema
                "description": f"Bioinformatics job at {company}. Visit the link to learn more.",  # Added description
                "postedDate": datetime.datetime.now(),  # Use current date if no posted date available
                "salary": "Not specified"  # Default salary field
            })
        except Exception as e:
            print(f"Error parsing Arc.dev job card: {e}")
    
    driver.quit()
    print(f"Found {len(jobs)} jobs from Arc.dev")
    return jobs

def scrape_linkedin_jobs(limit=20):
    """Scrape bioinformatics jobs from LinkedIn"""
    url = "https://www.linkedin.com/jobs/search/?keywords=bioinformatics&location=Worldwide"
    
    driver = setup_driver()
    print(f"Opening {url}...")
    driver.get(url)
    time.sleep(6)  # wait for JS to render
    
    jobs = []
    try:
        # Wait for job cards to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "base-card"))
        )
        
        cards = driver.find_elements(By.CLASS_NAME, "base-card")
        print(f"Found {len(cards)} LinkedIn job cards")
        
        for card in cards[:limit]:
            try:
                # Extract job title
                try:
                    title = card.find_element(By.CLASS_NAME, "base-search-card__title").text.strip()
                except:
                    title = "Bioinformatics Position"
                
                # Extract company name
                try:
                    company = card.find_element(By.CLASS_NAME, "base-search-card__subtitle").text.strip()
                except:
                    company = "Unknown Company"
                
                # Extract location
                try:
                    location = card.find_element(By.CLASS_NAME, "job-search-card__location").text.strip()
                except:
                    location = "Unknown Location"
                
                # Extract posted date
                try:
                    time_element = card.find_element(By.TAG_NAME, "time")
                    posted_date = time_element.get_attribute("datetime")
                    relative_time = time_element.text.strip()
                except:
                    posted_date = None
                    relative_time = "Unknown"
                
                # Extract job URL
                try:
                    link = card.find_element(By.TAG_NAME, "a").get_attribute("href")
                    # Clean LinkedIn tracking parameters from the URL
                    if "?" in link:
                        link = link.split("?")[0]
                except:
                    # Skip jobs without links
                    continue
                
                # Extract skills/tags (not directly available on LinkedIn search results)
                # We'll derive basic tags from the job title
                tags = ["Bioinformatics"]
                
                # Extract additional skills from title
                skills_keywords = ["python", "r", "ngs", "sequencing", "genomics", "phd", 
                                  "molecular", "research", "analysis", "data", "senior", 
                                  "scientist", "engineer", "developer", "analyst", "pipeline"]
                
                for skill in skills_keywords:
                    if re.search(r'\b' + skill + r'\b', title.lower()):
                        tags.append(skill.capitalize())
                
                # Determine job type
                job_type = "Full-time"
                if "remote" in location.lower() or "remote" in title.lower():
                    job_type = "Remote"
                elif "contract" in title.lower():
                    job_type = "Contract"
                elif "part" in title.lower() and "time" in title.lower():
                    job_type = "Part-time"
                elif "intern" in title.lower():
                    job_type = "Internship"
                
                # Add date scraped for freshness tracking
                date_scraped = datetime.datetime.now().strftime("%Y-%m-%d")
                
                # Convert posted_date string to datetime if available
                posted_datetime = None
                if posted_date:
                    try:
                        posted_datetime = datetime.datetime.fromisoformat(posted_date)
                    except:
                        posted_datetime = datetime.datetime.now()
                else:
                    posted_datetime = datetime.datetime.now()
                
                jobs.append({
                    "title": title,
                    "company": company,
                    "tags": tags,
                    "location": location,
                    "url": link,
                    "source": "LinkedIn",
                    "date_scraped": date_scraped,
                    "jobType": job_type,
                    "description": f"Bioinformatics job at {company}. Posted: {relative_time}. Visit the link to learn more.",
                    "postedDate": posted_datetime,
                    "salary": "Not specified"
                })
            except Exception as e:
                print(f"Error parsing LinkedIn job card: {e}")
    except Exception as e:
        print(f"Error scraping LinkedIn jobs: {e}")
    
    driver.quit()
    print(f"Found {len(jobs)} jobs from LinkedIn")
    return jobs

def save_jobs_to_json(jobs, output_file="public/data/bioinformatics_jobs.json"):
    """Save jobs to a JSON file with metadata"""
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    # Add metadata
    data = {
        "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "job_count": len(jobs),
        "jobs": jobs
    }
    
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"✅ Saved {len(jobs)} jobs to {output_file}")

def save_jobs_to_mongodb(jobs):
    """Save jobs to MongoDB database"""
    db = get_mongodb_connection()
    jobs_collection = db["jobs"]
    
    # Get count before update
    before_count = jobs_collection.count_documents({})
    
    # Insert or update jobs
    new_count = 0
    updated_count = 0
    
    for job in jobs:
        # Create a unique identifier based on job URL
        result = jobs_collection.update_one(
            {"url": job["url"]},
            {"$set": job},
            upsert=True
        )
        
        if result.upserted_id:
            new_count += 1
        elif result.modified_count:
            updated_count += 1
    
    # Get count after update
    after_count = jobs_collection.count_documents({})
    
    print(f"✅ MongoDB Update Summary:")
    print(f"   - Jobs before update: {before_count}")
    print(f"   - New jobs added: {new_count}")
    print(f"   - Existing jobs updated: {updated_count}")
    print(f"   - Total jobs in database: {after_count}")

def run_scraper():
    """Main function to run the scraper"""
    print("🌐 Scraping Bioinformatics Jobs...")
    
    # Scrape Arc.dev jobs
    arc_jobs = scrape_arc_jobs()
    
    # Scrape LinkedIn jobs
    linkedin_jobs = scrape_linkedin_jobs()
    
    # Combine all jobs
    all_jobs = arc_jobs + linkedin_jobs
    
    # Remove any duplicate jobs (based on title + company)
    unique_jobs = {}
    for job in all_jobs:
        key = f"{job['title']}|{job['company']}"
        if key not in unique_jobs:
            unique_jobs[key] = job
    
    final_jobs = list(unique_jobs.values())
    print(f"Total unique jobs found: {len(final_jobs)}")
    
    # Save to JSON file that React can access (keeping this for backward compatibility)
    save_jobs_to_json(final_jobs)
    
    # Save to MongoDB
    save_jobs_to_mongodb(final_jobs)
    
    return final_jobs

if __name__ == "__main__":
    run_scraper()