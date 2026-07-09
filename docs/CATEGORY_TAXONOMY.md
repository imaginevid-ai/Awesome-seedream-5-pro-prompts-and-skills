# Prompt Category Taxonomy

Every prompt has one primary workflow group and may keep several secondary facets. The primary group answers "what is the creator trying to accomplish?" Secondary use-case, style, and subject tags answer "what does it look like?"

## Primary Workflow Groups

1. **Directed Editing & Input Control**: modifies an existing image or uses regions, sketches, references, coordinates, or positional instructions to control a result.
2. **Commercial Design, UI & Posters**: produces an advertisement, campaign asset, interface, poster, typography layout, or other designed deliverable.
3. **Diagrams, Technical Art & Storyboards**: organizes information into diagrams, technical drawings, multi-panel sequences, shot lists, or storyboards.
4. **Characters, Cinema & Visual Styles**: explores characters, portraits, fashion, cinematic frames, lighting, cameras, or a defined visual style.
5. **Environments, Architecture & Worldbuilding**: makes a location, landscape, building, concept environment, or fictional world the central idea.
6. **Benchmarks & Model Comparisons**: evaluates prompt following, editing behavior, consistency, typography, or visual quality under controlled conditions.

## Decision Order

Use the first matching rule:

1. A controlled evaluation belongs to **Benchmarks & Model Comparisons**, even when its subject is a portrait or poster.
2. A request whose main action changes supplied visual material belongs to **Directed Editing & Input Control**.
3. A request whose value comes from ordered information or multiple planned frames belongs to **Diagrams, Technical Art & Storyboards**.
4. A request for a usable designed asset belongs to **Commercial Design, UI & Posters**.
5. A request centered on a place or fictional setting belongs to **Environments, Architecture & Worldbuilding**.
6. Remaining image-direction prompts belong to **Characters, Cinema & Visual Styles**.

Do not assign multiple primary groups to make a prompt easier to find. Add secondary facets instead.
