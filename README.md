# CINEMETA: Cold-Start Movie Recommendation System Using Meta-Learning

> **RV Institute of Technology and Management (RVITM)**  
> **Department of Information Science & Engineering**  
> **Academic Year: 2026–27 (Odd Sem)** | **Subject Code: BIS786** | **Subject Name: Project Work**

---

## 📌 Project Overview
**CINEMETA** is an advanced AI-powered movie recommendation platform engineered to solve the **cold-start problem** in recommender systems. By deploying a dynamic **Meta-Learning Adaptive Policy Controller**, CINEMETA dynamically transitions between **Content-Based Filtering (TF-IDF & Cosine Vector Similarity)** and **Collaborative Filtering (Latent Matrix Factorization)** based on real-time user interaction depth ($N$).

### 🚀 Key Technical Features
1. **Dynamic Meta-Learning Policy**:
   - **Cold-Start Phase ($N \le 2$ seed films)**: $80\%$ Content-Based TF-IDF + $20\%$ Community Regularization.
   - **Balanced Phase ($3 \le N \le 6$)**: $55\%$ Content Cosine Vector + $45\%$ Matrix Factorization.
   - **Deep Latent Matrix Phase ($N > 6$)**: $65\%$ Latent Matrix Factorization + $35\%$ Content Context.
2. **Real TMDb API Integration & Vector Ingestion**: Real-time caching, rate-limit retries, keywords extraction, director and cast matching.
3. **Quantitative Model Evaluation Metrics**:
   - **Precision@K** ($\text{Precision}@5, \text{Precision}@10$)
   - **Recall@K** ($\text{Recall}@10$)
   - **MAP@10** (Mean Average Precision)
   - **NDCG@10** (Normalized Discounted Cumulative Gain)
4. **Admin Telemetry & Analytics Dashboard**: Real-time visualization of model performance metrics, system latency, user interaction volume, and genre distribution.
5. **Secure Authentication & Session Management**: JWT token authentication, password hashing with `bcryptjs`, protected routes.
6. **Containerized Architecture**: Docker and Docker Compose setup for MongoDB and Node service orchestration.

---

## 📊 Algorithmic Formulations & Evaluation Metrics

### 1. Content-Based TF-IDF & Cosine Similarity
Feature vector extraction for movie document $M_i$:
$$V(M_i) = w_g \cdot \vec{\text{Genre}} + w_d \cdot \vec{\text{Director}} + w_c \cdot \vec{\text{Cast}} + w_k \cdot \vec{\text{Keywords}} + w_t \cdot \text{TF-IDF}(\text{Overview})$$
Cosine similarity between target candidate vector $V(C)$ and seed movie vector $V(S)$:
$$\text{Sim}(S, C) = \frac{V(S) \cdot V(C)}{\|V(S)\| \|V(C)\|}$$

### 2. Evaluation Formulas
- **Precision@K**:
  $$\text{Precision}@K = \frac{\sum_{i=1}^K \text{rel}(i)}{K}$$
- **Recall@K**:
  $$\text{Recall}@K = \frac{\sum_{i=1}^K \text{rel}(i)}{\min(|R|, K)}$$
- **NDCG@K**:
  $$\text{DCG}@K = \sum_{i=1}^K \frac{\text{rel}_i}{\log_2(i + 1)}, \quad \text{NDCG}@K = \frac{\text{DCG}@K}{\text{IDCG}@K}$$

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Motion, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript (`tsx`, `esbuild`) |
| **Machine Learning** | Meta-Learning Hybrid Policy, TF-IDF Vectorizer, Matrix Factorization, Cosine Similarity |
| **Database & Cache** | In-Memory JSON Store with optional MongoDB / Mongoose adapter |
| **External API** | TMDb API (The Movie Database) v3 |
| **Containerization** | Docker, Docker Compose, Multi-stage builds |

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# Node & Application Configuration
PORT=3000
NODE_ENV=development

# JWT Authentication Secret
JWT_SECRET=cinemeta_super_secret_jwt_key_2026

# TMDb API Integration Key
TMDB_API_KEY=your_tmdb_api_key_here

# MongoDB Database URI (Optional)
MONGODB_URI=mongodb://localhost:27017/cinemeta
```

---

## 🚀 Installation & Local Running

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/cinemeta.git
   cd cinemeta
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🐳 Docker Deployment

To launch the full stack (Node Web App + MongoDB Database) using Docker Compose:

```bash
docker-compose up --build -d
```
Access the application at `http://localhost:3000`.

---

## 📜 Academic Project Information
- **Institute**: RV Institute of Technology and Management (RVITM)
- **Department**: Department of Information Science and Engineering
- **Academic Year**: 2026 – 2027 (Odd Semester)
- **Subject**: Project Work (Subject Code: **BIS786**)
