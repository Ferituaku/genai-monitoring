from mlflow.metrics.genai import EvaluationExample, make_genai_metric
import os

def all_metric():
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_API_BASE = os.getenv("OPENAI_API_BASE")
    OPENAI_API_VERSION = os.getenv("OPENAI_API_VERSION")
    OPENAI_API_TYPE = os.getenv("OPENAI_API_TYPE")
    OPENAI_DEPLOYMENT_NAME = os.getenv("OPENAI_DEPLOYMENT_NAME")
    
    # Relevancy
    relevance_metric = make_genai_metric(
        name="relevance",
        definition=(
            "Relevance evaluates how closely the provided answer matches the intent of the prompt and whether the response aligns with the ground truth."
        ),
        grading_prompt=(
            '''Relevance: Evaluate the provided answer based on how well it matches the intent of the prompt:
            - Score 1: The answer is off-topic, irrelevant, or does not align with the ground truth.
            - Score 2: The answer partially addresses the intent of the prompt but has minor relevance issues compared to the ground truth.
            - Score 3: The answer directly fully aligns with the intent of the ground truth, even if it acknowledges a lack of specific information.'''
        ),
        examples=[
            EvaluationExample(
                input="aspek pajak atas share holder loan",
                output="Saat ini, saya tidak memiliki informasi spesifik yang berkaitan dengan pertanyaan tersebut.",
                score=3,
                justification="The response is align to ground truth."
            ),
            EvaluationExample(
                input="yayasan",
                output="Maaf, pertanyaan Anda kurang spesifik. Bisa tambahkan sedikit detail lagi agar kami dapat memberikan jawaban yang lebih jelas?",
                score=3,
                justification="The response aligns completely with the ground truth as it appropriately acknowledges the lack of specific information."
            )
        ],
        version="v1",
        model="openai:/gpt-4",
        parameters={"temperature": 0, "top_p": 1},
        grading_context_columns=[],
        aggregations=["mean", "variance", "p90"],
        greater_is_better=True,
    )

    # Accuracy
    accuracy_answer_metric = make_genai_metric(
        name="accuracy",
        definition=(
            "Accuracy measures how well the provided answers match the ground truth and aligns with the ground truth."
        ),
        grading_prompt=(
            '''Accuracy: Evaluate the answer based on how well it matches the ground truth:
            - Score 1: The answer contains significant inaccuracies, irrelevant information, or contradictions with the ground truth.
            - Score 2: The answer is mostly accurate but includes minor inaccuracies or overly verbose information that does not significantly affect alignment with the ground truth.
            - Score 3: The answer is fully accurate, concise, aligns completely with the ground truth, and contains no errors or irrelevant details.'''
        ),
        examples=[
            EvaluationExample(
                input="aspek pajak atas share holder loan",
                output="Saat ini, saya tidak memiliki informasi spesifik yang berkaitan dengan pertanyaan tersebut.",
                score=3,
                justification="The response aligns completely with the ground truth as it appropriately acknowledges the lack of specific information."
            ),
            EvaluationExample(
                input="yayasan",
                output="Maaf, pertanyaan Anda kurang spesifik. Bisa tambahkan sedikit detail lagi agar kami dapat memberikan jawaban yang lebih jelas?",
                score=3,
                justification="The response aligns completely with the ground truth as it appropriately acknowledges the lack of specific information."
            ),
        ],
        version="v1",
        model="openai:/gpt-4",
        parameters={"temperature": 0, "top_p": 1},
        grading_context_columns=[],
        aggregations=["mean", "variance", "p90"],
        greater_is_better=True,
    )

    # Completeness
    completeness_metric = make_genai_metric(
        name="completeness",
        definition=(
            "Completeness evaluates how thoroughly and accurately the provided answer addresses all aspects of the prompt and aligns with the ground truth. A complete response includes all necessary details or acknowledges when specific information is unavailable, ensuring it fully satisfies the intent of the question."
        ),
        grading_prompt=(
            '''Completeness: Evaluate the answer based on how well it addresses the prompt or aligns with the ground truth:
            - Score 1: The answer is incomplete, does not address the prompt or align with the ground truth.
            - Score 2: The answer addresses most aspects of the prompt or partially aligns with the ground truth but is missing some details.
            - Score 3: The answer fully addresses the prompt or aligns perfectly with the ground truth, including acknowledging any lack of specific information where applicable.'''
        ),
        examples=[
            EvaluationExample(
                input="aspek pajak atas share holder loan",
                output="Saat ini, saya tidak memiliki informasi spesifik yang berkaitan dengan pertanyaan tersebut.",
                score=3,
                justification="The response fully addresses the prompt by appropriately acknowledging the lack of specific information, which aligns with the ground truth."
            ),
            EvaluationExample(
                input="yayasan",
                output="Maaf, pertanyaan Anda kurang spesifik. Bisa tambahkan sedikit detail lagi agar kami dapat memberikan jawaban yang lebih jelas?",
                score=3,
                justification="The response fully addresses the prompt by asking for more details, which aligns with the ground truth in the absence of sufficient context."
            ),
        ],
        version="v1",
        model="openai:/gpt-4",
        parameters={"temperature": 0, "top_p": 1},
        grading_context_columns=[],
        aggregations=["mean", "variance", "p90"],
        greater_is_better=True,
    )

    # Clarity
    clarity_metric = make_genai_metric(
        name="clarity",
        definition=(
            "Clarity measures how clear and easy to understand the response is. "
            "A perfect clarity score means the response is precise, well-structured, and free of ambiguity or overly complex language."
        ),
        grading_prompt=(
            '''Clarity: Evaluate the answer based on how clear and easy it is to understand:
            - Score 1: The answer is unclear, difficult to understand, and does not match the ground truth.
            - Score 2: The answer is generally clear but has minor ambiguities or inconsistencies that could cause confusion.
            - Score 3: The answer is very clear, easy to understand, or matches the ground truth even if it is unclear or ambiguous.
            
            Note: If the response matches the ground truth in content, it should be evaluated as a perfect score (3) for clarity.'''
        ),
        examples=[
            EvaluationExample(
                input="aspek pajak atas share holder loan",
                output="Saat ini, saya tidak memiliki informasi spesifik yang berkaitan dengan pertanyaan tersebut.",
                score=3,
                justification="The response is clear and directly addresses the input by stating the lack of specific information. It avoids ambiguity and uses simple, concise language to communicate effectively."
            ),
            EvaluationExample(
                input="yayasan",
                output="Maaf, pertanyaan Anda kurang spesifik. Bisa tambahkan sedikit detail lagi agar kami dapat memberikan jawaban yang lebih jelas?",
                score=3,
                justification="The response is clear and easy to understand. It explicitly asks for more details in a polite and straightforward manner, ensuring the user knows how to proceed for a more helpful answer."
            ),
        ],
        version="v1",
        model="openai:/gpt-4",
        parameters={"temperature": 0, "top_p": 1},
        grading_context_columns=[],
        aggregations=["mean", "variance", "p90"],
        greater_is_better=True,
    )

    # Coherence
    coherence_metric = make_genai_metric(
        name="coherence",
        definition=(
            "Coherence evaluates the logical flow, consistency, and organization of the response. A perfect coherence score means the response is well-structured, makes sense, and aligns logically with the ground truth."
        ),
        grading_prompt=(
            '''Coherence: Evaluate the response based on its logical flow, organization, and consistency:
            - Score 1: The answer lacks logical flow, contains contradictions, not make sense, or making it difficult to understand
            - Score 2: The answer is mostly coherent, with minor inconsistencies or areas lacking clear connection.
            - Score 3: The answer is fully coherent, logically organized, make sense, and aligns with the ground truth.'''
        ),
        examples=[
            EvaluationExample(
                input="aspek pajak atas share holder loan",
                output="Saat ini, saya tidak memiliki informasi spesifik yang berkaitan dengan pertanyaan tersebut.",
                score=3,
                justification="The response is coherent and logically structured. It acknowledges the lack of specific information in a clear and understandable manner, which aligns well with the ground truth."
            ),
            EvaluationExample(
                input="yayasan",
                output="Maaf, pertanyaan Anda kurang spesifik. Bisa tambahkan sedikit detail lagi agar kami dapat memberikan jawaban yang lebih jelas?",
                score=3,
                justification="The response is coherent and logically structured. It requests more specific details in a straightforward and easy-to-understand manner, aligning with the ground truth."
            ),
        ],
        version="v1",
        model="openai:/gpt-4",
        parameters={"temperature": 0, "top_p": 1},
        grading_context_columns=[],
        aggregations=["mean", "variance", "p90"],
        greater_is_better=True,
    )

    # Appropriateness
    appropriateness_metric = make_genai_metric(
        name="appropriateness",
        definition=(
            "Appropriateness evaluates whether the tone, style, and language of the response align with the context of the prompt and ground truth. "
            "A perfect appropriateness score reflects a response that uses the correct tone, style, and language while remaining respectful, professional, and contextually relevant."
        ),
        grading_prompt=(
            '''Appropriateness: Evaluate the response based on tone, style, language, and respectfulness:
            - Score 1: The tone, style, or language is inappropriate, unprofessional, or irrelevant to the context.
            - Score 2: The tone, style, and language are appropriate but have minor issues, such as slight mismatches in formality, word choice, or phrasing, that could be improved.
            - Score 3: The tone, style, and language are perfectly appropriate, respectful, professional, and fully aligned with the prompt's context and ground truth.'''
        ),
        examples=[
            EvaluationExample(
                input="aspek pajak atas share holder loan",
                output="Saat ini, saya tidak memiliki informasi spesifik yang berkaitan dengan pertanyaan tersebut.",
                score=3,
                justification="The response is align to ground truth."
            )
        ],
        version="v1",
        model="openai:/gpt-4",
        parameters={"temperature": 0, "top_p": 1},
        grading_context_columns=[],
        aggregations=["mean", "variance", "p90"],
        greater_is_better=True,
    )

    consistency_metric = make_genai_metric(
        name="consistency",
        definition=("Consistency measures whether the response remains consistent across multiple iterations of the same question. "
                    "A perfect consistency score means that the answers to repeated questions do not contradict each other or change meaning."
                    "Is the response consistent when the same question is repeated?"),
        grading_prompt=(
            "Consistency: Evaluate the response based on how well it aligns across repeated questions: "
            "- Score 1: Contradictory or entirely different answers for the same question. "
            "- Score 2: Minor inconsistencies in one out of three repeated questions. "
            "- Score 3: Fully consistent answers across all repeated questions."
        ),
        examples=[
            EvaluationExample(
                input=["What is MLflow?", "What is MLflow?", "What is MLflow?"],
                output=[
                    "MLflow is a tool for managing machine learning projects. It includes experiment tracking and model deployment.",
                    "MLflow is a tool for managing machine learning projects. It includes experiment tracking and model deployment.",
                    "MLflow is a tool for managing machine learning projects. It includes experiment tracking and model deployment."
                ],
                score=3,
                justification=("The answers are consistent across all three repeated questions, with no contradictions or variations.")
            ),
            EvaluationExample(
                input=["What is MLflow?", "What is MLflow?", "What is MLflow?"],
                output=[
                    "MLflow is a tool for managing machine learning projects. It helps track experiments and deploy models.",
                    "MLflow is software for managing machine learning workflows, like tracking and packaging models.",
                    "MLflow is a tool for managing machine learning projects. It includes experiment tracking and model deployment."
                ],
                score=2,
                justification=("The answers are mostly consistent, but there are slight variations in phrasing and details across the responses.")
            ),
            EvaluationExample(
                input=["What is MLflow?", "What is MLflow?", "What is MLflow?"],
                output=[
                    "MLflow is a tool for managing machine learning projects.",
                    "MLflow is software for cooking recipes.",
                    "MLflow is unrelated to machine learning."
                ],
                score=1,
                justification=("The answers are inconsistent and contradictory, with significant deviations in meaning across the responses.")
            ),
        ],
        version="v1",
        model="openai:/gpt-4",
        parameters={"temperature": 0, "top_p": 1},
        grading_context_columns=[],
        aggregations=["mean", "variance", "p90"],
        greater_is_better=True,
    )

    return relevance_metric, accuracy_answer_metric, completeness_metric, clarity_metric, coherence_metric, appropriateness_metric, consistency_metric