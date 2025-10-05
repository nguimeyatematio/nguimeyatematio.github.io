# Academic Personal Website

A modern, responsive, and feature-rich personal website template designed for GitHub Pages. This template provides a professional platform for academics to showcase their research, publications, talks, and other academic activities.

## 🌟 Features

* **Responsive Design**: Mobile-first design that works perfectly on all devices
* **Dark/Light Theme**: Toggle between dark and light themes with smooth transitions
* **Dynamic Content**: JSON-based configuration for easy content management
* **Search Functionality**: Search through publications, talks, and blog posts
* **Visitor Analytics**: Built-in visitor counter and analytics tracking
* **SEO Optimized**: Meta tags, structured data, and social media cards
* **Accessibility**: WCAG 2.1 AA compliant
* **Modern Technologies**: HTML5, CSS3, Vanilla JavaScript
* **Easy Deployment**: Ready for GitHub Pages deployment

## 📁 Project Structure

```
pacomenguimeya.github.io/
├── index.html                 # Main homepage
├── README.md                  # This file
├── _config.yml                # GitHub Pages configuration
├── assets/
│   ├── abstracts/             # Paper abstracts (PDFs, etc.)
│   ├── blog/                  # Blog post HTML files
│   ├── books/                 # Book/Chapter PDFs
│   ├── conferences/           # Conference paper PDFs
│   ├── cv/                    # CV files
│   │   └── cv.pdf
│   ├── images/                # Images (profile, backgrounds, favicon, preview)
│   ├── journals/              # Journal article PDFs
│   ├── mentoring/             # Mentoring-related assets (PDFs)
│   ├── posters/               # Poster PDFs
│   ├── slides/                # Slides (PDF/PPT)
│   ├── teaching/              # Course materials (PDF/ZIP)
│   ├── tutorials/             # Tutorial materials (PDF/ZIP)
│   ├── tutoring/              # Tutoring materials (PDF/ZIP)
│   └── videos/                # Video files (MP4, etc.)
├── css/
│   ├── main.css               # Main stylesheet
│   └── theme.css              # Theme-specific styles
├── js/
│   ├── main.js                # Main JavaScript functionality
│   ├── search.js              # Search functionality
│   └── counter.js             # Visitor counter and analytics
└── data/
    ├── blog.json              # Blog posts metadata
    ├── books.json             # Books & chapters data
    ├── conferences.json       # Conference papers data
    ├── config.json            # Site configuration
    ├── courses.json           # Teaching: courses
    ├── journals.json          # Journal articles data
    ├── mentoring.json         # Teaching: mentoring
    ├── talks.json             # Talks and presentations data
    ├── tutorials.json         # Tutorials data
    └── tutoring.json          # Teaching: tutoring
```

## 🚀 Quick Start

### 1. Fork and Clone

1. Fork this repository to your GitHub account
2. Clone it to your local machine:

   ```bash
   git clone https://github.com/yourusername/yourusername.github.io.git
   cd yourusername.github.io
   ```

### 2. Customize Your Information

#### Update Site Configuration (`data/config.json`)

```json
{
  "site": {
    "title": "Your Name - Academic Personal Website",
    "author": "Your Name",
    "email": "your.email@university.edu",
    "url": "https://yourusername.github.io"
  },
  "profile": {
    "name": "Your Name",
    "title": "Your Title",
    "affiliation": "Your Institution",
    "image": "assets/images/profile.jpg",
    "cv": "assets/cv/cv.pdf"
  }
}
```

#### Add Your Publications

Publications are split into **conferences**, **journals**, and **books/chapters**:

* `data/conferences.json`
* `data/journals.json`
* `data/books.json`

Example (conference item):

```json
[
  {
    "id": "conf-2024-example",
    "title": "Your Conference Paper Title",
    "authors": ["Your Name", "Co-Author"],
    "venue": "Conference Name",
    "year": 2024,
    "pdf": "assets/conferences/yourpaper.pdf",
    "doi": "https://doi.org/...",
    "slides": "assets/slides/yourtalk.pdf"
  }
]
```

Example (journal item):

```json
[
  {
    "id": "jour-2024-example",
    "title": "Your Journal Article Title",
    "authors": ["Your Name", "Co-Author"],
    "venue": "Journal Name",
    "year": 2024,
    "pdf": "assets/journals/yourarticle.pdf",
    "doi": "https://doi.org/..."
  }
]
```

Example (book/chapter item):

```json
[
  {
    "id": "book-2024-example",
    "title": "Your Book/Chapter Title",
    "authors": ["Your Name"],
    "venue": "Publisher / Book Title",
    "year": 2024,
    "pdf": "assets/books/yourchapter.pdf"
  }
]
```

#### Update Talks (`data/talks.json`)

```json
[
  {
    "id": "talk-2024-example",
    "title": "Your Talk Title",
    "event": "Conference/Event Name",
    "date": "2024-01-01",
    "slides": "assets/slides/yourtalk.pdf",
    "video": "assets/videos/yourtalk.mp4",
    "materials": ["assets/slides/extra-materials.zip"]
  }
]
```

#### Add Blog Posts (`data/blog.json`)

HTML files live in `assets/blog/`. Point each entry to its HTML file:

```json
[
  {
    "id": "post-2024-example",
    "title": "Your Blog Post Title",
    "date": "2024-01-01",
    "description": "Brief description...",
    "url": "assets/blog/your-post.html",
    "tags": ["tag1", "tag2"]
  }
]
```

#### Teaching & Tutorials

* Courses: `data/courses.json`
* Tutoring: `data/tutoring.json`
* Mentoring: `data/mentoring.json`
* Tutorials: `data/tutorials.json`

Example (tutorial):

```json
[
  {
    "id": "tut-2024-example",
    "title": "DFT Band Structure with QE + Wannier90",
    "date": "2024-05-10",
    "description": "Step-by-step workflow and plotting.",
    "url": "assets/tutorials/dft-band-structure.html",
    "difficulty": "Intermediate",
    "duration": "45 min"
  }
]
```

### 3. Add Your Assets

* **Profile Photo**: Replace `assets/images/profile.jpg`
* **CV**: Add `assets/cv/cv.pdf`
* **Conference/Journal/Books PDFs**: Place in `assets/conferences/`, `assets/journals/`, `assets/books/`
* **Slides**: Add to `assets/slides/`
* **Blog Posts**: HTML files in `assets/blog/`
* **Background Images**: Add to `assets/images/` (used via `data-bg` attributes and CSS)

### 4. Deploy to GitHub Pages

1. Go to your repository settings on GitHub
2. Scroll to **Pages**
3. Select **Deploy from a branch**
4. Choose **main** branch and **/(root)** folder
5. Click **Save**

Your site will be available at `https://yourusername.github.io`

## 🎨 Customization

### Changing Colors and Themes

Edit `css/theme.css` to customize colors:

```css
:root {
    --primary-color: #2563eb;    /* Main accent color */
    --secondary-color: #64748b;  /* Secondary text color */
    --accent-color: #059669;     /* Accent highlights */
}
```

### Adding New Sections

1. Add the section to navigation in `data/config.json`
2. Create the HTML structure in `index.html`
3. Add corresponding CSS styles
4. Update the JavaScript navigation logic (in `js/main.js`)

### Customizing Background Images

Replace the images in `assets/images/` and/or update section backgrounds via CSS rules that target `[data-bg]` attributes or your theme styles in `css/theme.css`.

## 📝 Content Management

### Adding Publications

1. Put PDFs in:

   * `assets/conferences/`
   * `assets/journals/`
   * `assets/books/`

2. Update:

   * `data/conferences.json`
   * `data/journals.json`
   * `data/books.json`

3. Include DOIs, slides, code links, or videos where applicable.

### Creating Blog Posts

1. Create an HTML file in `assets/blog/`
2. Add an entry in `data/blog.json` pointing to that file (`url`)
3. (Optional) Use a consistent minimal HTML scaffold (title, meta, content)

### Managing Talks

Update `data/talks.json` with:

* Titles, events, and dates
* Links to `assets/slides/` and `assets/videos/`
* Optional `materials` array for extra files (ZIP/PDF)

### Teaching & Tutorials

* Courses in `data/courses.json` with assets in `assets/teaching/`
* Tutoring in `data/tutoring.json` with assets in `assets/tutoring/`
* Mentoring in `data/mentoring.json` with assets in `assets/mentoring/`
* Tutorials in `data/tutorials.json` with assets in `assets/tutorials/`

## 🔧 Advanced Features

### Search Functionality

The search feature indexes:

* Publication metadata
* Talks metadata
* Blog post metadata
* (Optionally) other structured content from `data/`

No extra setup needed beyond keeping your JSON files updated.

### Visitor Analytics

Built-in analytics track:

* Total visitors
* Page views
* Scroll depth
* Time spent on site
* Section popularity

### Performance Optimization

* Images are lazy-loaded
* CSS and JS are optimized
* Responsive layout for all screen sizes
* Optional service worker can be added for PWA behavior

## 🛠️ Development

### Local Development

Use a local server for development:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Visit `http://localhost:8000` to see your site.

### Browser Support

* Chrome/Edge 80+
* Firefox 75+
* Safari 13+
* Mobile browsers

## 📱 Mobile Optimization

The site is fully responsive with:

* Mobile-first design approach
* Touch-friendly navigation
* Optimized images for mobile
* Fast loading on slow connections

## 📄 License

This website template is provided free of charge for personal use.
You are welcome to reuse or adapt it, provided that proper attribution is given to the original author.

**Recommended attribution:**
*"Based on the personal website of Dr. Nguimeya Tematio Gaël-Pacôme"*


**Built with accessibility and performance in mind. Happy Academic Websiting! 🎓**

