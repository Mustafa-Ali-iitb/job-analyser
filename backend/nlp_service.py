import re
from collections import Counter, defaultdict
from typing import List, Dict, Set, Optional, Tuple
import logging

import spacy
from spacy.matcher import PhraseMatcher
from transformers import pipeline
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.text_rank import TextRankSummarizer
import nltk

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize NLTK resources
for resource in ["punkt", "punkt_tab"]:
    try:
        nltk.data.find(f"tokenizers/{resource}")
    except LookupError:
        nltk.download(resource)

# Load NLP models
try:
    nlp = spacy.load("en_core_web_md")
    summarizer = pipeline("text2text-generation", model="google/flan-t5-base", device=-1)
    logger.info("NLP models loaded successfully")
except Exception as e:
    logger.error(f"Error loading NLP models: {e}")
    raise

# Technical skills database
TECH_SKILLS = [
    # Programming Languages
    'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
    'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash', 'sql', 'html', 'css',

    # Frontend Technologies
    'react', 'angular', 'vue', 'sass', 'less', 'bootstrap', 'tailwind', 'jquery', 'webpack', 
    'babel', 'npm', 'yarn', 'next.js', 'nuxt.js', 'gatsby',

    # Backend Technologies
    'node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'laravel', 'rails',
    'asp.net', '.net', 'graphql', 'rest api', 'microservices', 'serverless',

    # Databases
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sqlite', 
    'cassandra', 'dynamodb', 'firebase', 'supabase',

    # Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab',
    'terraform', 'ansible', 'linux', 'unix', 'ci/cd', 'devops', 'helm',

    # Data Science & ML
    'machine learning', 'deep learning', 'ai', 'data science', 'pandas', 'numpy',
    'tensorflow', 'pytorch', 'scikit-learn', 'jupyter', 'tableau', 'power bi', 'spark',
    'hadoop', 'kafka', 'airflow',

    # Mobile Development
    'ios', 'android', 'react native', 'flutter', 'xamarin',

    # Other Tools
    'agile', 'scrum', 'jira', 'confluence', 'slack', 'figma', 'sketch', 'adobe xd'
]

ROLE_TITLES = [
    'frontend developer', 'backend developer', 'fullstack developer', 'data scientist',
    'devops engineer', 'mobile developer', 'qa engineer', 'product manager',
    'ui/ux designer', 'software engineer', 'java developer', 'python developer',
    'web developer', 'cloud engineer', 'data engineer', 'machine learning engineer',
    'site reliability engineer', 'security engineer', 'database administrator'
]

RESPONSIBILITY_HEADERS = [
    "responsibilities", "responsibility", "key responsibilities", "duties",
    "tasks", "accountabilities", "what you will do", "your impact", "role"
]

REQUIREMENT_HEADERS = [
    "requirements", "qualifications", "skills required", "must have",
    "needed", "what we're looking for", "you bring", "preferred", "nice to have"
]

# Initialize phrase matcher for skills extraction
matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
patterns = [nlp.make_doc(skill) for skill in TECH_SKILLS]
matcher.add("TECH_SKILLS", patterns)


def chunk_text(text: str, max_words: int = 400) -> List[str]:
    """Split text into chunks for processing."""
    words = text.split()
    return [' '.join(words[i:i+max_words]) for i in range(0, len(words), max_words)]


def extractive_summary(text: str, sentence_count: int = 4) -> str:
    """Generate extractive summary using TextRank algorithm."""
    try:
        cleaned_text = re.sub(r'\s+', ' ', text.strip())
        
        parser = PlaintextParser.from_string(cleaned_text, Tokenizer("english"))
        summarizer_obj = TextRankSummarizer()
        summary_sentences = summarizer_obj(parser.document, sentence_count)
        
        summary_lines = []
        for sentence in summary_sentences:
            line = str(sentence).strip()
            if line:
                summary_lines.append(line)
        
        summary = '\n'.join(summary_lines)
        summary = re.sub(r'\s+', ' ', summary).strip()
        
        if summary and not summary.endswith('.'):
            summary += '.'
            
        return summary
        
    except Exception as e:
        logger.warning(f"Extractive summary failed: {e}")
        return _generate_fallback_summary(text)


def _generate_fallback_summary(text: str) -> str:
    """Generate fallback summary when extractive summarization fails."""
    summary_parts = []
    
    # Extract role and main responsibility
    role_patterns = [
        r'[^.]*full stack[^.]*\.',
        r'[^.]*fullstack[^.]*\.',
        r'[^.]*software developer[^.]*\.',
        r'[^.]*engineer[^.]*\.'
    ]
    
    for pattern in role_patterns:
        matches = re.findall(pattern, text, flags=re.IGNORECASE)
        if matches and len(summary_parts) < 1:
            summary_parts.append(matches[0].strip())
    
    # Extract responsibility sentences
    responsibility_patterns = [
        r'[^.]*responsible for[^.]*\.',
        r'[^.]*will[^.]*\.',
        r'[^.]*develop[^.]*\.',
        r'[^.]*create[^.]*\.',
        r'[^.]*build[^.]*\.',
        r'[^.]*design[^.]*\.',
        r'[^.]*collaborate[^.]*\.',
        r'[^.]*work with[^.]*\.',
        r'[^.]*assist[^.]*\.',
        r'[^.]*support[^.]*\.'
    ]
    
    for pattern in responsibility_patterns:
        matches = re.findall(pattern, text, flags=re.IGNORECASE)
        if matches and len(summary_parts) < 2:
            summary_parts.append(matches[0].strip())
    
    # Extract experience requirements
    experience_patterns = [
        r'[^.]*\d+\+?\s*years?[^.]*\.',
        r'[^.]*experience[^.]*\.',
        r'[^.]*qualifications[^.]*\.',
        r'[^.]*requirements[^.]*\.',
        r'[^.]*degree[^.]*\.'
    ]
    
    for pattern in experience_patterns:
        matches = re.findall(pattern, text, flags=re.IGNORECASE)
        if matches and len(summary_parts) < 3:
            summary_parts.append(matches[0].strip())
    
    # Extract work environment
    environment_patterns = [
        r'[^.]*team[^.]*\.',
        r'[^.]*collaboration[^.]*\.',
        r'[^.]*organization[^.]*\.',
        r'[^.]*mentor[^.]*\.'
    ]
    
    for pattern in environment_patterns:
        matches = re.findall(pattern, text, flags=re.IGNORECASE)
        if matches and len(summary_parts) < 4:
            summary_parts.append(matches[0].strip())
    
    if summary_parts:
        if len(summary_parts) < 3:
            if len(summary_parts) == 1:
                summary_parts.extend([
                    "Responsible for developing and maintaining software applications",
                    "Requires experience in software development and programming",
                    "Collaborates with cross-functional teams to deliver solutions"
                ])
            elif len(summary_parts) == 2:
                summary_parts.extend([
                    "Requires experience in software development and programming",
                    "Collaborates with cross-functional teams to deliver solutions"
                ])
        
        return '\n'.join(summary_parts[:4])
    
    # Final fallback
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip() and len(s.strip()) > 20]
    
    if sentences:
        selected_sentences = sentences[:4]
        while len(selected_sentences) < 3:
            selected_sentences.append("Responsible for software development and system maintenance")
        
        fallback_summary = '\n'.join(selected_sentences)
        return fallback_summary[:400] if len(fallback_summary) > 400 else fallback_summary
    
    return "Software Developer\nResponsible for developing and maintaining software applications\nRequires experience in software development and programming\nCollaborates with cross-functional teams to deliver high-quality solutions"


def extract_skills(doc) -> List[str]:
    """Extract technical skills from job description using multiple methods."""
    found_skills = set()

    # Method 1: PhraseMatcher for exact matches
    matches = matcher(doc)
    for _, start, end in matches:
        found_skills.add(doc[start:end].text.lower())

    # Method 2: Named Entity Recognition
    for ent in doc.ents:
        if ent.label_ in ["ORG", "PRODUCT", "LANGUAGE", "WORK_OF_ART"]:
            if ent.text.lower() in TECH_SKILLS:
                found_skills.add(ent.text.lower())

    # Method 3: Keyword extraction
    text_lower = doc.text.lower()
    for skill in TECH_SKILLS:
        if skill in text_lower:
            found_skills.add(skill)

    # Method 4: Fallback to keyword extraction
    if not found_skills:
        tokens = [token.lemma_.lower() for token in doc 
                 if not token.is_stop and token.is_alpha and 
                 token.pos_ in ["NOUN", "PROPN"] and len(token.text) > 2]
        top_keywords = [word for word, _ in Counter(tokens).most_common(5)]
        found_skills.update(top_keywords)

    logger.info(f"Extracted skills: {found_skills}")
    return sorted(list(found_skills))


def detect_job_role(doc, skills: List[str]) -> str:
    """Detect job role using multiple strategies."""
    text = doc.text.lower()

    # Strategy 1: Direct role mentions
    direct_role_patterns = [
        r'(?:seeking|looking for|hiring)\s+(?:a|an)?\s*([\w\s/-]+?(?:developer|engineer|scientist|manager|designer|analyst))',
        r'(?:join us as|position as|role as)\s+(?:a|an)?\s*([\w\s/-]+?(?:developer|engineer|scientist|manager|designer|analyst))',
        r'([\w\s/-]+?(?:developer|engineer|scientist|manager|designer|analyst))\s+(?:who|responsible|position|role)',
        r'(?:we are|we\'re)\s+([\w\s/-]+?(?:developer|engineer|scientist|manager|designer|analyst))',
    ]
    
    for pattern in direct_role_patterns:
        matches = re.findall(pattern, text, flags=re.IGNORECASE)
        if matches:
            candidate = matches[0].strip().lower()
            logger.info(f"Direct role pattern matched: '{candidate}'")
            
            candidate = re.sub(r'\s+', ' ', candidate).strip()
            
            for role in ROLE_TITLES:
                if role in candidate or candidate in role:
                    logger.info(f"Matched predefined role: '{role}'")
                    return role.title()
            
            if any(word in candidate for word in ['developer', 'engineer', 'scientist', 'manager', 'designer', 'analyst']):
                return candidate.title()

    # Strategy 2: Keyword frequency analysis
    role_counts = Counter()
    for role in ROLE_TITLES:
        count = text.count(role)
        if count >= 1:
            role_counts[role] = count
    
    if role_counts:
        selected_role = max(role_counts, key=role_counts.get)
        logger.info(f"Role detected by keyword frequency: '{selected_role}' ({role_counts[selected_role]} occurrences)")
        return selected_role.title()

    # Strategy 3: Skill-based inference
    frontend_skills = {'react', 'angular', 'vue', 'html', 'css', 'javascript', 'typescript', 'bootstrap', 'tailwind', 'jquery', 'sass', 'express'}
    backend_skills = {'spring', 'django', 'flask', 'fastapi', 'node.js', 'express', 'microservices', 'java', 'python', 'c#', 'php', 'ruby', 'go', 'pl/sql'}
    data_skills = {'data science', 'machine learning', 'pytorch', 'tensorflow', 'pandas', 'numpy', 'spark', 'scikit-learn', 'ai', 'deep learning'}
    devops_skills = {'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'terraform', 'ansible', 'ci/cd', 'devops', 'git', 'github', 'npm'}

    fe_count = len([s for s in skills if s in frontend_skills])
    be_count = len([s for s in skills if s in backend_skills])
    ds_count = len([s for s in skills if s in data_skills])
    devops_count = len([s for s in skills if s in devops_skills])

    logger.info(f"Skill-based inference counts -> FE: {fe_count}, BE: {be_count}, DS: {ds_count}, DevOps: {devops_count}")

    if fe_count >= 3 and be_count >= 3:
        return "Fullstack Developer"
    elif fe_count >= 2 and be_count >= 2:
        return "Fullstack Developer"
    elif devops_count >= 3:
        return "DevOps Engineer"
    elif ds_count >= 2:
        return "Data Scientist"
    elif be_count >= 2:
        return "Backend Developer"
    elif fe_count >= 2:
        return "Frontend Developer"
    elif be_count >= 1:
        return "Backend Developer"
    elif fe_count >= 1:
        return "Frontend Developer"
    elif ds_count >= 1:
        return "Data Scientist"

    return "Software Developer"


def extract_sections(text: str) -> Dict[str, List[str]]:
    """Extract responsibilities and requirements sections from job description."""
    sections = defaultdict(list)
    lines = re.split(r'[\n\r]+', text)
    current_section = None

    for line in lines:
        clean_line = line.strip().lstrip("0123456789.-•* ").strip()
        if not clean_line:
            continue
            
        lower = clean_line.lower()

        if any(header in lower for header in RESPONSIBILITY_HEADERS):
            current_section = "responsibilities"
            continue
        if any(header in lower for header in REQUIREMENT_HEADERS):
            current_section = "requirements"
            continue

        if current_section and len(clean_line) > 10:
            sections[current_section].append(clean_line)

    logger.info(f"Extracted sections: {dict(sections)}")
    return sections


def clean_summary(summary: str, original_text: str) -> str:
    """Clean summary to remove company background and unrelated information."""
    sentences = re.split(r'[.!?]+', summary)
    cleaned_sentences = []
    
    company_keywords = [
        'tradeweb', 'amazon', 'google', 'microsoft', 'apple', 'facebook', 'meta',
        'global leader', 'leading', 'established', 'founded', 'headquartered',
        'serving', 'serves', 'clientele', 'customers', 'mission', 'vision', 'values',
        'culture', 'benefits', 'perks', 'insurance', '401k', 'equal opportunity',
        'diversity', 'inclusive', 'eeo', 'recognized', 'awarded', 'ranked',
        'best companies', 'trillion', 'revenue', 'growth', 'ipo', 'acquisitions',
        'mastech', 'pittsburgh', 'nyse', 'minority-owned', 'certified'
    ]
    
    job_keywords = [
        'responsible', 'develop', 'create', 'build', 'design', 'implement',
        'programming', 'software', 'platform', 'systems', 'features',
        'components', 'libraries', 'deadlines', 'support', 'improvements',
        'distributed', 'scalable', 'microservices', 'collaborate', 'work with',
        'experience', 'requirements', 'qualifications', 'team', 'project'
    ]
    
    technical_skills = [
        'angular', 'react', 'nodejs', 'express', 'html', 'css', 'sass', 'javascript',
        'java', 'spring', 'python', 'aws', 'azure', 'docker', 'kubernetes',
        'jenkins', 'git', 'github', 'npm', 'graphql', 'sql', 'pl/sql'
    ]
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
            
        has_company_info = any(keyword in sentence.lower() for keyword in company_keywords)
        has_technical_skills = any(skill in sentence.lower() for skill in technical_skills)
        has_job_info = any(keyword in sentence.lower() for keyword in job_keywords)
        
        if has_job_info and not has_company_info and not has_technical_skills:
            cleaned_sentences.append(sentence)
        elif len(sentence.split()) <= 8 and not has_company_info and not has_technical_skills:
            cleaned_sentences.append(sentence)
    
    if not cleaned_sentences:
        responsibility_patterns = [
            r'responsible for[^.]*\.',
            r'will[^.]*\.',
            r'develop[^.]*\.',
            r'create[^.]*\.',
            r'build[^.]*\.'
        ]
        
        for pattern in responsibility_patterns:
            matches = re.findall(pattern, original_text, flags=re.IGNORECASE)
            if matches:
                cleaned_sentences.append(matches[0])
                break
    
    cleaned_summary = '. '.join(cleaned_sentences)
    cleaned_summary = re.sub(r'\s+', ' ', cleaned_summary).strip()
    
    if cleaned_summary and not cleaned_summary.endswith('.'):
        cleaned_summary += '.'
    
    return cleaned_summary


def generate_summary(text: str, role: str, skills: List[str]) -> str:
    """Generate a comprehensive job description summary."""
    try:
        prompt = f"""Write a comprehensive 3-4 line job summary for this position.

Structure the summary with 3-4 distinct lines covering:
Line 1: Role and main responsibility
Line 2: Key duties and responsibilities
Line 3: Required experience and qualifications
Line 4: Work environment and team collaboration

Focus on:
- Detailed role responsibilities
- Experience requirements and qualifications
- Team collaboration and project scope
- Work environment and industry focus

Avoid:
- Company background or history
- Benefits, perks, or compensation
- Company culture or values
- Technical skills (these are listed separately)

Job Description: {text[:1200]}
Role: {role}
Experience Level: {detect_experience_level(text)}

Summary:"""

        result = summarizer(
            prompt,
            max_new_tokens=120,
            min_length=50,
            num_beams=3,
            no_repeat_ngram_size=2,
            early_stopping=True,
            temperature=0.5,
            do_sample=False
        )
        
        generated_summary = result[0]['generated_text'].strip()
        
        if (generated_summary.startswith("Write a") or 
            generated_summary.startswith("Summary:") or
            generated_summary.startswith("Line 1:") or
            generated_summary.startswith("Focus on:") or
            len(generated_summary.split()) < 10 or
            "]" in generated_summary or
            "[" in generated_summary or
            "Line 1:" in generated_summary or
            "Line 2:" in generated_summary):
            logger.info("Model generated poor output, using extractive summary")
            generated_summary = extractive_summary(text)
        
        if len(generated_summary.split()) < 15 or len(generated_summary) < 80:
            logger.info("Generated summary too short, using extractive summary")
            generated_summary = extractive_summary(text)
        
        generated_summary = clean_summary(generated_summary, text)
        return generated_summary

    except Exception as e:
        logger.error(f"Error in generate_summary: {e}")
        return extractive_summary(text)


def detect_experience_level(text: str) -> str:
    """Detect experience level from job description."""
    years_patterns = [
        r'(\d+)\+?\s*years?',
        r'(\d+)\+?\s*yrs?',
        r'(\d+)\s*to\s*(\d+)\s*years?',
        r'(\d+)\+?\s*years?\s*of\s*experience'
    ]
    
    years_found = []
    for pattern in years_patterns:
        matches = re.findall(pattern, text, flags=re.IGNORECASE)
        for match in matches:
            if isinstance(match, tuple):
                for x in match:
                    if x.isdigit():
                        years_found.append(int(x))
            elif match.isdigit():
                years_found.append(int(match))

    if years_found:
        max_years = max(years_found)
        if max_years <= 2:
            return 'Junior (0-2 years)'
        elif max_years <= 5:
            return 'Mid-level (3-5 years)'
        elif max_years <= 8:
            return 'Senior (6-8 years)'
        else:
            return 'Principal/Lead (8+ years)'

    level_keywords = {
        'Intern': ['intern', 'internship', 'trainee', 'student'],
        'Junior (0-2 years)': ['junior', 'entry', 'fresher', 'graduate', 'new grad'],
        'Mid-level (3-5 years)': ['mid-level', 'intermediate', 'regular', 'experienced'],
        'Senior (6-8 years)': ['senior', 'sr.', 'lead', 'experienced'],
        'Principal/Lead (8+ years)': ['principal', 'staff', 'architect', 'director', 'head of', 'vp', 'chief']
    }
    
    for level, keywords in level_keywords.items():
        if any(keyword in text.lower() for keyword in keywords):
            return level
            
    return 'Mid-level (3-5 years)'


def analyze_job_description(text: str) -> Dict[str, any]:
    """Main function to analyze job description and return comprehensive insights."""
    try:
        if not text or len(text.strip()) < 50:
            raise ValueError("Job description text is too short or empty")
            
        logger.info(f"Analyzing job description of length: {len(text)}")
        
        doc = nlp(text)
        skills = extract_skills(doc)
        role = detect_job_role(doc, skills)
        experience_level = detect_experience_level(text)
        summary = generate_summary(text, role, skills)

        result = {
            'skills': skills,
            'role_type': role,
            'experience_level': experience_level,
            'summary': summary,
            'sections': extract_sections(text)
        }
        
        logger.info(f"Analysis completed successfully. Role: {role}, Skills: {len(skills)}")
        return result
        
    except Exception as e:
        logger.error(f"Error in analyze_job_description: {e}")
        raise