import os
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class RAGService:

    def __init__(self):
        # Find the backend folder
        self.backend_dir = Path(__file__).resolve().parent.parent

        # Location of our disaster knowledge
        self.knowledge_file = (
            self.backend_dir
            / "knowledge_base"
            / "disaster_safety.txt"
        )

        self.documents = []
        self.vectorizer = None
        self.document_vectors = None

        self.load_knowledge_base()

    def load_knowledge_base(self):
        """
        Load disaster safety information and split it
        into separate knowledge chunks.
        """

        if not self.knowledge_file.exists():
            print("ERROR: Knowledge base file not found:")
            print(self.knowledge_file)
            return

        try:
            with open(
                self.knowledge_file,
                "r",
                encoding="utf-8"
            ) as file:

                text = file.read()

            # Split the document into sections.
            # Each section separated by a blank line
            # becomes one retrievable document.
            chunks = [
                chunk.strip()
                for chunk in text.split("\n\n")
                if chunk.strip()
            ]

            self.documents = chunks

            # Convert text into TF-IDF vectors
            self.vectorizer = TfidfVectorizer(
                lowercase=True,
                stop_words="english"
            )

            self.document_vectors = (
                self.vectorizer.fit_transform(self.documents)
            )

            print("RAG knowledge base loaded successfully")
            print(f"Knowledge chunks: {len(self.documents)}")

        except Exception as e:
            print("ERROR loading knowledge base:")
            print(str(e))

    def retrieve(self, query, top_k=3):
        """
        Find the most relevant knowledge chunks
        for the user's emergency query.
        """

        if not self.documents:
            return []

        if self.vectorizer is None:
            return []

        try:
            # Convert user query into a TF-IDF vector
            query_vector = self.vectorizer.transform([query])

            # Calculate similarity between query and
            # every knowledge chunk
            similarities = cosine_similarity(
                query_vector,
                self.document_vectors
            )[0]

            # Get indexes sorted by similarity
            ranked_indexes = similarities.argsort()[::-1]

            results = []

            for index in ranked_indexes[:top_k]:

                score = float(similarities[index])

                # Ignore completely unrelated chunks
                if score <= 0:
                    continue

                results.append({
                    "content": self.documents[index],
                    "score": round(score, 4)
                })

            return results

        except Exception as e:
            print("ERROR during RAG retrieval:")
            print(str(e))
            return []

    def get_context(self, query, top_k=3):
        """
        Retrieve relevant knowledge and combine it
        into a single context string.
        """

        results = self.retrieve(
            query=query,
            top_k=top_k
        )

        if not results:
            return "No relevant emergency safety information found."

        context_parts = []

        for i, result in enumerate(results, start=1):

            context_parts.append(
                f"--- Safety Knowledge {i} "
                f"(relevance: {result['score']}) ---\n"
                f"{result['content']}"
            )

        return "\n\n".join(context_parts)


# Create one shared RAG service
rag_service = RAGService()