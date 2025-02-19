"""
openlit.evals

This module provides a set of classes for analyzing text for various types of
content-based vulnerabilities,
such as Hallucination, Bias, and Toxicity detection.
"""

from AICORELibrary.openlit.evals.hallucination import Hallucination
from AICORELibrary.openlit.evals.bias_detection import BiasDetector
from AICORELibrary.openlit.evals.toxicity import ToxicityDetector
from AICORELibrary.openlit.evals.all import All
