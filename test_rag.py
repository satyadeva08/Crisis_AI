from services.rag_service import rag_service


print("========================================")
print("          RESQ AI - RAG TEST")
print("========================================")


query = """
Severe flood water has entered houses.
Several people are trapped and vehicles are submerged.
Rescue teams need to immediately help the victims.
"""


print("\nUSER EMERGENCY:")
print(query)


print("\n========== RETRIEVED KNOWLEDGE ==========")


results = rag_service.retrieve(
    query=query,
    top_k=3
)


for i, result in enumerate(results, start=1):

    print(f"\n--- RESULT {i} ---")
    print(f"Relevance Score: {result['score']}")
    print(result["content"])


print("\n========== COMBINED RAG CONTEXT ==========")

context = rag_service.get_context(
    query=query,
    top_k=3
)

print(context)


print("\n========================================")
print("              RAG TEST END")
print("========================================")