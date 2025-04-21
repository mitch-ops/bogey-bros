import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import gameService, {
  GameScores,
  GameResults,
  Player,
} from "../services/gameService";
import { useAuth } from "../context/AuthContext";

// Define the route params type
type PlayStackParamList = {
  LiveGame: {
    gameMode: string;
    stake: number;
    course: string;
    betEnabled: boolean;
    players: Player[];
    game: any; // Update this with proper type if available
    gameName: string;
  };
  PlayMain: undefined;
};

type LiveGameRouteProp = RouteProp<PlayStackParamList, "LiveGame">;

const LiveGameScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<LiveGameRouteProp>();
  const { authState } = useAuth();

  // Extract parameters
  const { gameMode, stake, course, betEnabled, players, game, gameName } =
    route.params;

  // Game state
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentHole, setCurrentHole] = useState(1);
  const [gameScores, setGameScores] = useState<GameScores | null>(null);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);
  const [scoreInputVisible, setScoreInputVisible] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [newScore, setNewScore] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [resultsModalVisible, setResultsModalVisible] = useState(false);
  const [isEndingGame, setIsEndingGame] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Player mapping
  const [playerMap, setPlayerMap] = useState<Record<string, Player>>({});
  const [playerMaps, setPlayerMaps] = useState({
    idToUsername: {},
    usernameToId: {},
  });

  // Current user ID
  const currentUserId = (authState as any)?.userId || "";

  // Determine if user is the game creator (first participant)
  const isGameCreator =
    game?.participants?.length > 0 && game.participants[0] === currentUserId;

  // This function builds a direct mapping between player IDs and usernames
  const buildPlayerMappings = useCallback(() => {
    // Create maps for both ID→Username and Username→ID
    const idToUsername = {};
    const usernameToId = {};

    console.log("Building player mappings from all available sources");

    // Add mappings from players prop
    if (players && players.length > 0) {
      console.log("Adding mappings from players prop");
      players.forEach((player) => {
        if (player.id && player.username) {
          idToUsername[player.id] = player.username;
          usernameToId[player.username] = player.id;
          console.log(`Mapped: ${player.id} ↔ ${player.username}`);
        }
      });
    }

    // Add mappings from gameScores.participants
    if (gameScores && gameScores.participants) {
      console.log("Adding mappings from gameScores.participants");
      gameScores.participants.forEach((participant) => {
        if (participant._id && participant.username) {
          idToUsername[participant._id] = participant.username;
          usernameToId[participant.username] = participant._id;
          console.log(`Mapped: ${participant._id} ↔ ${participant.username}`);
        }
      });
    }

    // Log the mappings for debugging
    console.log("Final ID to Username mapping:", idToUsername);
    console.log("Final Username to ID mapping:", usernameToId);

    setPlayerMaps({ idToUsername, usernameToId });
  }, [players, gameScores]);

  useEffect(() => {
    buildPlayerMappings();
  }, [players, gameScores, buildPlayerMappings]);

  // Load game data on mount and when game name changes
  useEffect(() => {
    if (gameName) {
      loadGameData();
    } else {
      setIsLoading(false);
    }
  }, [gameName]);

  // Function to transform database format to frontend format
  const transformScoresFormat = (databaseScores, playerCount) => {
    console.log("Transforming database scores format to frontend format");
    console.log("Database scores:", JSON.stringify(databaseScores));

    // Initialize frontend scores array (playerCount arrays, each with 18 holes)
    const frontendScores = Array(playerCount)
      .fill(0)
      .map(() => Array(18).fill(0));

    // Convert from hole-based to player-based structure
    databaseScores.forEach((holeScores, holeIndex) => {
      // Each holeScores is an array of player scores for this hole
      holeScores.forEach((playerScore, playerIndex) => {
        // Skip if beyond player count
        if (playerIndex < playerCount) {
          // In frontend format, first index is player, second is hole
          frontendScores[playerIndex][holeIndex] = playerScore;
        }
      });
    });

    console.log("Transformed frontend scores:", JSON.stringify(frontendScores));
    return frontendScores;
  };

  // Function to transform bet results data
  const transformBetResults = (resultsData, playerIds) => {
    console.log("Transforming bet results data:", JSON.stringify(resultsData));

    // Create a map to store each player's bet status
    const betStatusMap: Record<string, number> = {}; // Could change to non type

    // Initialize all players with $0
    playerIds.forEach((id) => {
      betStatusMap[id] = 0;
    });

    // Process creditors (players who are winning money)
    if (resultsData.creditors && Array.isArray(resultsData.creditors)) {
      resultsData.creditors.forEach((creditor) => {
        if (creditor.idStr && creditor.amount) {
          betStatusMap[creditor.idStr] = creditor.amount;
        }
      });
    }

    // Process debtors (players who are losing money)
    if (resultsData.debtors && Array.isArray(resultsData.debtors)) {
      resultsData.debtors.forEach((debtor) => {
        if (debtor.idStr && debtor.amount) {
          betStatusMap[debtor.idStr] = -debtor.amount; // Negative amount for debtors
        }
      });
    }

    console.log("Transformed bet status map:", betStatusMap);

    // Convert to expected results format
    const transformedResults = {
      results: Object.keys(betStatusMap).map((playerId) => ({
        playerId,
        betStatus: betStatusMap[playerId],
      })),
    };

    console.log("Transformed results:", JSON.stringify(transformedResults));
    return transformedResults;
  };

  // Load game data from API
  const loadGameData = useCallback(async () => {
    if (!gameName) {
      console.error("No game name provided");
      setIsLoading(false);
      return;
    }

    console.log(`Loading game data for: ${gameName}`);
    setIsLoading(true);

    try {
      // Fetch game scores
      console.log("Fetching game scores...");
      const scoresResponse = await gameService.getGameScores(gameName);
      console.log("Game scores received:", JSON.stringify(scoresResponse));

      // Check if response is an array (scores only format)
      if (Array.isArray(scoresResponse) && !scoresResponse.participants) {
        console.log(
          "Received scores array format, converting to expected structure"
        );

        // Transform to frontend format (player-based arrays)
        const playerCount = players.length;
        const transformedScores = transformScoresFormat(
          scoresResponse,
          playerCount
        );

        // Create a complete game structure using the scores array and player info
        const convertedScores = {
          participants: players.map((player) => ({
            _id: player.id,
            username: player.username,
            handicap: player.handicap || 0,
          })),
          scores: transformedScores,
          totals: transformedScores.map((playerScores) => {
            // Calculate total for each player
            const total = playerScores.reduce(
              (sum, score) => sum + (score || 0),
              0
            );
            return [total];
          }),
        };

        console.log("Converted scores:", JSON.stringify(convertedScores));
        setGameScores(convertedScores);
      } else if (scoresResponse && scoresResponse.participants) {
        // Standard format with participants
        console.log("Received standard format with participants");
        setGameScores(scoresResponse);
      } else {
        // No valid data, create initial structure
        console.log("No valid data found, creating initial game structure");
        const initialScores = {
          participants: players.map((player) => ({
            _id: player.id,
            username: player.username,
            handicap: player.handicap || 0,
          })),
          scores: players.map(() => Array(18).fill(0)),
          totals: players.map(() => [0]),
        };

        setGameScores(initialScores);
      }

      // Update player map
      const updatedMap = { ...playerMap };
      players.forEach((player) => {
        if (player.id && !updatedMap[player.id]) {
          updatedMap[player.id] = player;
        }
      });
      setPlayerMap(updatedMap);

      // If betting is enabled, fetch results
      if (betEnabled) {
        try {
          console.log("Fetching game results...");
          const results = await gameService.getGameResults(gameName);
          console.log("Game results received:", JSON.stringify(results));

          // Store the results directly, regardless of format
          setGameResults(results);

          // Log all player IDs in the game for debugging
          console.log(
            "Current players:",
            players.map((p) => ({ id: p.id, username: p.username }))
          );

          if (results.creditors || results.debtors) {
            console.log("Creditors:", results.creditors);
            console.log("Debtors:", results.debtors);
          }
        } catch (error) {
          console.error("Failed to fetch game results:", error);
        }
      }

      console.log("Game data loaded successfully");
    } catch (error) {
      console.error("Error loading game data:", error);

      // Create initial structure on error
      const initialScores = {
        participants: players.map((player) => ({
          _id: player.id,
          username: player.username,
          handicap: player.handicap || 0,
        })),
        scores: players.map(() => Array(18).fill(0)),
        totals: players.map(() => [0]),
      };

      setGameScores(initialScores);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [gameName, betEnabled, playerMap, players]);

  const handlePullToRefresh = useCallback(() => {
    setRefreshing(true);
    loadGameData();
  }, [loadGameData]);

  // Handle manual refresh
  const handleManualRefresh = () => {
    console.log("Manual refresh requested");
    setRefreshing(true);
    loadGameData();
  };

  // Navigate to next hole
  const goToNextHole = () => {
    if (currentHole < 18) {
      setCurrentHole((prevHole) => prevHole + 1);
    } else {
      Alert.alert(
        "Round Complete",
        "You have completed all 18 holes! Would you like to see the results?",
        [
          { text: "View Results", onPress: () => setResultsModalVisible(true) },
          { text: "Continue Editing", style: "cancel" },
        ]
      );
    }
  };

  // Navigate to previous hole
  const goToPreviousHole = () => {
    if (currentHole > 1) {
      setCurrentHole((prevHole) => prevHole - 1);
    }
  };

  // Open score input modal
  const openScoreInput = () => {
    console.log("Opening score input modal");

    // If there's no game data, create a basic structure
    if (
      !gameScores ||
      !gameScores.participants ||
      gameScores.participants.length === 0
    ) {
      // Create initial game structure based on route parameters
      const initialScores: GameScores = {
        participants: players.map((player) => ({
          _id: player.id,
          username: player.username,
          handicap: player.handicap || 0,
        })),
        scores: players.map(() => Array(18).fill(0)),
        totals: players.map(() => [0]),
      };

      setGameScores(initialScores);
    }

    // Find current user's player ID
    const playerIndex =
      gameScores?.participants?.findIndex((p) => p._id === currentUserId) ||
      players.findIndex((p) => p.id === currentUserId);

    if (playerIndex === -1) {
      console.log("Player not found, using first player");
      // If player not found, use the first player or create new
      setSelectedPlayerId(players[0]?.id || currentUserId);
      setNewScore("");
    } else {
      // Set selected player ID to current user
      setSelectedPlayerId(currentUserId);

      // Get current score for this player and hole if it exists
      let currentScore = "";
      if (gameScores?.scores?.[playerIndex]?.[currentHole - 1] !== undefined) {
        currentScore =
          gameScores.scores[playerIndex][currentHole - 1].toString();
      }

      setNewScore(currentScore || "");
    }

    setScoreInputVisible(true);
  };

  // Save a player's score
  const saveScore = async () => {
    if (!selectedPlayerId) {
      console.error("No player selected");
      Alert.alert("Error", "No player selected. Please try again.");
      return;
    }

    if (!newScore) {
      console.error("No score entered");
      Alert.alert("Error", "Please enter a score.");
      return;
    }

    if (!gameName) {
      console.error("No game name provided");
      Alert.alert("Error", "Game information missing. Please try again.");
      return;
    }

    const score = parseInt(newScore);
    if (isNaN(score) || score < 1) {
      Alert.alert("Invalid Score", "Please enter a valid score (minimum 1).");
      return;
    }

    setIsSaving(true);
    try {
      console.log(
        `Saving score: ${score} for hole ${currentHole} in game: ${gameName}`
      );

      // Attempt to save the score to the server
      await gameService.updateScore(gameName, currentHole, score);
      console.log("Score saved to server successfully");

      // Update local state to show the change immediately
      if (gameScores) {
        const updatedScores = { ...gameScores };

        // Find the player index
        const playerIndex = updatedScores.participants.findIndex(
          (p) => p._id === selectedPlayerId
        );
        console.log(`Updating local state for player index: ${playerIndex}`);

        if (playerIndex !== -1) {
          // Ensure scores array exists
          if (!updatedScores.scores) {
            updatedScores.scores = [];
          }

          // Ensure player's scores array exists
          if (!updatedScores.scores[playerIndex]) {
            updatedScores.scores[playerIndex] = Array(18).fill(0);
          }

          // Make sure array is long enough for current hole
          while (updatedScores.scores[playerIndex].length < currentHole) {
            updatedScores.scores[playerIndex].push(0);
          }

          // Update the score
          updatedScores.scores[playerIndex][currentHole - 1] = score;
          console.log(`Updated local score at hole ${currentHole} to ${score}`);

          // Ensure totals array exists
          if (!updatedScores.totals) {
            updatedScores.totals = [];
          }

          // Ensure player's totals array exists
          if (!updatedScores.totals[playerIndex]) {
            updatedScores.totals[playerIndex] = [0];
          }

          // Calculate new total
          updatedScores.totals[playerIndex][0] = updatedScores.scores[
            playerIndex
          ].reduce((sum, holeScore) => sum + (holeScore || 0), 0);
          console.log(
            `Updated total score to ${updatedScores.totals[playerIndex][0]}`
          );

          setGameScores(updatedScores);
        } else {
          console.error(`Player index not found: ${selectedPlayerId}`);
        }
      } else {
        console.error("No game scores object to update");
      }

      // Close the modal
      setScoreInputVisible(false);
      // Alert.alert("Success", "Your score has been saved.");

      // If betting is enabled, refresh the results
      if (betEnabled) {
        try {
          const results = await gameService.getGameResults(gameName);
          setGameResults(results);
        } catch (error) {
          console.error("Failed to refresh game results:", error);
        }
      }
    } catch (error) {
      console.error("Error saving score:", error);

      // Attempt to update local state even if server update fails
      if (gameScores) {
        try {
          const updatedScores = { ...gameScores };
          const playerIndex = updatedScores.participants.findIndex(
            (p) => p._id === selectedPlayerId
          );

          if (playerIndex !== -1) {
            if (!updatedScores.scores) updatedScores.scores = [];
            if (!updatedScores.scores[playerIndex])
              updatedScores.scores[playerIndex] = [];

            while (updatedScores.scores[playerIndex].length < currentHole) {
              updatedScores.scores[playerIndex].push(0);
            }

            updatedScores.scores[playerIndex][currentHole - 1] = score;

            if (!updatedScores.totals) updatedScores.totals = [];
            if (!updatedScores.totals[playerIndex])
              updatedScores.totals[playerIndex] = [0];

            updatedScores.totals[playerIndex][0] = updatedScores.scores[
              playerIndex
            ].reduce((sum, holeScore) => sum + (holeScore || 0), 0);

            setGameScores(updatedScores);
          }
        } catch (localUpdateError) {
          console.error("Failed to update local state:", localUpdateError);
        }
      }

      Alert.alert(
        "Warning",
        "Your score was saved locally but we had trouble updating the server. Your changes may not be synced with other players.",
        [{ text: "OK", onPress: () => setScoreInputVisible(false) }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  // End the game
  const handleEndGame = async () => {
    if (!gameName) return;

    // Confirm with the user
    Alert.alert(
      "End Game",
      "Are you sure you want to end this game? This will finalize all scores and betting results.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Game",
          style: "destructive",
          onPress: async () => {
            setIsEndingGame(true);
            try {
              await gameService.endGame(gameName);

              // Show final results
              const results = await gameService.getGameResults(gameName);
              setGameResults(results);
              setResultsModalVisible(true);

              Alert.alert(
                "Game Ended",
                "The game has been successfully completed.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      // Navigate back to home after delay
                      setTimeout(() => {
                        navigation.navigate("PlayMain" as never);
                      }, 500);
                    },
                  },
                ]
              );
            } catch (error) {
              console.error("Error ending game:", error);
              Alert.alert("Error", "Failed to end the game. Please try again.");
            } finally {
              setIsEndingGame(false);
            }
          },
        },
      ]
    );
  };

  // Get player score for current hole
  const getPlayerScore = (playerId: string): string => {
    if (!gameScores) return "-";

    const playerIndex = gameScores.participants.findIndex(
      (p) => p._id === playerId
    );
    if (playerIndex === -1) return "-";

    return (gameScores.scores[playerIndex]?.[currentHole - 1] || 0).toString();
  };

  // Get player total score
  const getPlayerTotal = (playerId: string): string => {
    if (!gameScores) return "-";

    const playerIndex = gameScores.participants.findIndex(
      (p) => p._id === playerId
    );
    if (playerIndex === -1) return "-";

    if (
      gameScores.totals &&
      gameScores.totals[playerIndex]?.[0] !== undefined
    ) {
      const total = gameScores.totals[playerIndex][0];

      // Format the total score (E for even, +/- for over/under par)
      if (total === 0) return "E";
      if (total > 0) return `+${total}`;
      return total.toString();
    }

    // Calculate total if not provided
    const total = gameScores.scores[playerIndex]
      .filter((score) => score !== undefined)
      .reduce((sum, score) => sum + (score || 0), 0);

    // Format the total score
    if (total === 0) return "E";
    if (total > 0) return `+${total}`;
    return total.toString();
  };

  // Get player bet status
  const getPlayerBetStatus = (playerId: string): string => {
    if (!gameResults) {
      console.log(`No game results available for player ${playerId}`);
      return "-";
    }

    // Log available player IDs for debugging
    console.log(`Looking for bet status for player: ${playerId}`);
    console.log("Game results data:", JSON.stringify(gameResults, null, 2));

    // Check if we have the new format with creditors/debtors
    if (gameResults.creditors || gameResults.debtors) {
      console.log("Using creditors/debtors format");

      // Check if player is a creditor (winning money)
      if (gameResults.creditors && Array.isArray(gameResults.creditors)) {
        for (const creditor of gameResults.creditors) {
          console.log(
            `Comparing creditor ${creditor.idStr} with player ${playerId}`
          );
          if (creditor.idStr === playerId) {
            return `+$${creditor.amount.toFixed(2)}`;
          }
        }
      }

      // Check if player is a debtor (losing money)
      if (gameResults.debtors && Array.isArray(gameResults.debtors)) {
        for (const debtor of gameResults.debtors) {
          console.log(
            `Comparing debtor ${debtor.idStr} with player ${playerId}`
          );
          if (debtor.idStr === playerId) {
            return `-$${debtor.amount.toFixed(2)}`;
          }
        }
      }

      // Default to zero if player found in neither list
      console.log(
        `Player ${playerId} not found in either creditors or debtors`
      );
      return "$0.00";
    }

    // Original format with results array
    if (gameResults.results) {
      console.log("Using results array format");
      const playerResult = gameResults.results.find(
        (r) => r.playerId === playerId
      );
      if (!playerResult || playerResult.betStatus === undefined) {
        console.log(`No result found for player ${playerId} in results array`);
        return "-";
      }

      const status = playerResult.betStatus;
      if (status > 0) return `+$${status.toFixed(2)}`;
      if (status < 0) return `-$${Math.abs(status).toFixed(2)}`;
      return "$0.00";
    }

    console.log("Unrecognized game results format");
    return "-";
  };

  // Function to ensure we have the full list of player IDs from multiple sources
  const gatherAllPlayerIds = () => {
    const ids = new Set();

    // Add IDs from players array
    players.forEach((player) => {
      if (player.id) ids.add(player.id);
    });

    // Add IDs from gameScores participants
    if (gameScores && gameScores.participants) {
      gameScores.participants.forEach((participant) => {
        if (participant._id) ids.add(participant._id);
      });
    }

    // Add IDs from game.participants
    if (game && game.participants) {
      game.participants.forEach((id) => {
        if (id) ids.add(id);
      });
    }

    // Add IDs from gameResults
    if (gameResults) {
      // From creditors
      if (gameResults.creditors) {
        gameResults.creditors.forEach((creditor) => {
          if (creditor.idStr) ids.add(creditor.idStr);
        });
      }

      // From debtors
      if (gameResults.debtors) {
        gameResults.debtors.forEach((debtor) => {
          if (debtor.idStr) ids.add(debtor.idStr);
        });
      }

      // From results array
      if (gameResults.results) {
        gameResults.results.forEach((result) => {
          if (result.playerId) ids.add(result.playerId);
        });
      }
    }

    return Array.from(ids);
  };

  // Final updated renderNetAmount function with fixed inference logic
  const renderNetAmount = (participant) => {
    if (!gameResults || (!gameResults.creditors && !gameResults.debtors)) {
      return "-";
    }

    const playerId = participant._id;
    const username = participant.username;

    console.log(`Rendering net amount for ${username} (ID: ${playerId})`);

    // Get all player IDs for reference
    const allPlayerIds = gameScores?.participants?.map((p) => p._id) || [];
    const creatorId = game?.participants?.[0];
    const isCreator = playerId === creatorId;

    // Flag whether this is a 2-player game
    const isTwoPlayerGame = allPlayerIds.length === 2;

    // First check direct matches in creditors
    let foundAsCreditor = false;
    if (gameResults.creditors && gameResults.creditors.length > 0) {
      const creditor = gameResults.creditors.find((c) => c.idStr === playerId);
      if (creditor) {
        console.log(`Found ${username} directly as creditor`);
        return `+$${creditor.amount.toFixed(2)}`;
      }
    }

    // Then check direct matches in debtors
    if (gameResults.debtors && gameResults.debtors.length > 0) {
      const debtor = gameResults.debtors.find((d) => d.idStr === playerId);
      if (debtor) {
        console.log(`Found ${username} directly as debtor`);
        return `-$${debtor.amount.toFixed(2)}`;
      }
    }

    // If we're in a 2-player game and didn't find a direct match, we need to infer
    if (isTwoPlayerGame) {
      console.log("Two-player game detected, using inference logic");

      // Get the other player's ID
      const otherPlayerId = allPlayerIds.find((id) => id !== playerId);
      console.log(`This player: ${playerId}, Other player: ${otherPlayerId}`);

      // Check if other player is a creditor
      if (gameResults.creditors && gameResults.creditors.length > 0) {
        const otherPlayerCreditor = gameResults.creditors.find(
          (c) => c.idStr === otherPlayerId
        );
        if (otherPlayerCreditor) {
          console.log(
            `Other player found as creditor: ${JSON.stringify(
              otherPlayerCreditor
            )}`
          );
          return `-$${otherPlayerCreditor.amount.toFixed(2)}`;
        }
      }

      // Check if other player is a debtor
      if (gameResults.debtors && gameResults.debtors.length > 0) {
        const otherPlayerDebtor = gameResults.debtors.find(
          (d) => d.idStr === otherPlayerId
        );
        if (otherPlayerDebtor) {
          console.log(
            `Other player found as debtor: ${JSON.stringify(otherPlayerDebtor)}`
          );
          return `+$${otherPlayerDebtor.amount.toFixed(2)}`;
        }
      }

      // Check if there's any creditor/debtor without matching to a specific player
      if (gameResults.creditors?.length === 1) {
        // If there's exactly one creditor but it didn't match either player directly,
        // assume it belongs to the creator
        const creditor = gameResults.creditors[0];
        if (isCreator) {
          console.log("Inferring creator is the unmatched creditor");
          return `+$${creditor.amount.toFixed(2)}`;
        } else {
          console.log("Inferring other player is the unmatched creditor");
          return `-$${creditor.amount.toFixed(2)}`;
        }
      }

      if (gameResults.debtors?.length === 1) {
        // If there's exactly one debtor but it didn't match either player directly,
        // assume it belongs to the creator
        const debtor = gameResults.debtors[0];
        if (isCreator) {
          console.log("Inferring creator is the unmatched debtor");
          return `-$${debtor.amount.toFixed(2)}`;
        } else {
          console.log("Inferring other player is the unmatched debtor");
          return `+$${debtor.amount.toFixed(2)}`;
        }
      }
    }

    // If we couldn't infer anything, default to zero
    console.log(`No bet information could be determined for ${username}`);
    return "$0.00";
  };

  // Render score input modal
  const renderScoreInputModal = () => (
    <Modal
      visible={scoreInputVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setScoreInputVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Enter Score for Hole {currentHole}
          </Text>

          <TextInput
            style={styles.scoreInput}
            value={newScore}
            onChangeText={setNewScore}
            placeholder="Enter score"
            keyboardType="number-pad"
            autoFocus
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setScoreInputVisible(false)}
              disabled={isSaving}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={saveScore}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render results modal
  const renderResultsModal = () => (
    <Modal
      visible={resultsModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setResultsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Game Results</Text>

          <View style={styles.resultsTable}>
            <View style={styles.resultsHeader}>
              <Text style={[styles.resultsHeaderText, { flex: 2 }]}>
                Player
              </Text>
              <Text style={[styles.resultsHeaderText, { flex: 1 }]}>Total</Text>
              {betEnabled && (
                <Text style={[styles.resultsHeaderText, { flex: 1 }]}>
                  Winnings
                </Text>
              )}
            </View>

            {gameScores?.participants.map((participant, index) => (
              <View key={participant._id} style={styles.resultsRow}>
                <Text style={[styles.resultsText, { flex: 2 }]}>
                  {participant.username}
                  {participant._id === currentUserId ? " (You)" : ""}
                </Text>
                <Text style={[styles.resultsText, { flex: 1 }]}>
                  {getPlayerTotal(participant._id)}
                </Text>
                {betEnabled && (
                  <Text
                    style={[
                      styles.resultsText,
                      {
                        flex: 1,
                        color: getPlayerBetStatus(participant._id).startsWith(
                          "+"
                        )
                          ? "green"
                          : getPlayerBetStatus(participant._id).startsWith("-")
                          ? "red"
                          : "black",
                      },
                    ]}
                  >
                    {getPlayerBetStatus(participant._id)}
                  </Text>
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setResultsModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Function to get the player name or "You" for current user
  const getPlayerName = (participant: any) => {
    return participant._id === currentUserId ? "You" : participant.username;
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5C4DB1" />
          <Text style={styles.loadingText}>Loading game data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              loadGameData();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handlePullToRefresh}
            colors={["#5C4DB1"]}
          />
        }
      >
        <View style={styles.container}>
          <View style={styles.topSection}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Live Game</Text>
              <View style={styles.headerRightContainer}>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={handleManualRefresh}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="refresh" size={24} color="white" />
                  )}
                </TouchableOpacity>
                <Text style={styles.holeText}>{currentHole}</Text>
              </View>
            </View>
            <Text style={styles.subheading}>
              Thru {currentHole > 1 ? currentHole - 1 : 0}
            </Text>

            <View style={[styles.row, styles.tableHeader]}>
              <Text style={[styles.cell, styles.tableHeaderText]}>Player</Text>
              <Text style={[styles.cell, styles.tableHeaderText]}>Score</Text>
              <Text style={[styles.cell, styles.tableHeaderText]}>Total</Text>
              <Text style={[styles.cell, styles.tableHeaderText]}>Net $</Text>
            </View>

            {/* Check if gameScores exists before mapping */}
            {gameScores && gameScores.participants ? (
              gameScores.participants.map((participant) => (
                <View key={participant._id} style={styles.row}>
                  <Text style={styles.cell}>{getPlayerName(participant)}</Text>
                  <Text style={styles.cell}>
                    {getPlayerScore(participant._id)}
                  </Text>
                  <Text style={styles.cell}>
                    {getPlayerTotal(participant._id)}
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      {
                        color: renderNetAmount(participant).startsWith("+")
                          ? "green"
                          : renderNetAmount(participant).startsWith("-")
                          ? "red"
                          : "black",
                      },
                    ]}
                  >
                    {renderNetAmount(participant)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.row}>
                <Text style={[styles.cell, styles.noDataText]}>
                  No player data available
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setResultsModalVisible(true)}
        >
          <Text style={styles.buttonText}>View Scorecard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.activeButton]}
          onPress={openScoreInput}
        >
          <Text style={[styles.buttonText, styles.activeButtonText]}>
            Enter Score
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={goToNextHole}>
          <View style={styles.nextHoleButton}>
            <Text style={styles.buttonText}>Next Hole</Text>
            <Ionicons name="chevron-forward" size={18} color="#333" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Render modals */}
      {renderScoreInputModal()}
      {renderResultsModal()}
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  topSection: {
    marginTop: 40,
  },
  header: {
    backgroundColor: "#5C4DB1",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  holeText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  subheading: {
    fontSize: 16,
    marginBottom: 8,
  },
  tableHeader: {
    backgroundColor: "#5C4DB1",
    borderRadius: 6,
  },
  tableHeaderText: {
    color: "white",
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  cell: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  button: {
    flex: 1,
    padding: 12,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
    borderRadius: 6,
  },
  activeButton: {
    backgroundColor: "#5C4DB1",
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
  },
  activeButtonText: {
    color: "#fff",
  },
  nextHoleButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  scoreInput: {
    width: "100%",
    height: 48,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 12,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: "#5C4DB1",
    marginLeft: 8,
  },

  // Results modal styles
  resultsTable: {
    width: "100%",
    marginBottom: 16,
  },
  resultsHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 8,
    marginBottom: 8,
  },
  resultsHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  resultsRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  resultsText: {
    fontSize: 14,
    color: "#333333",
  },
  closeButton: {
    backgroundColor: "#5C4DB1",
    borderRadius: 8,
    padding: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#5C4DB1",
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButton: {
    marginRight: 12,
    padding: 4,
  }, // Handle pull-to-refresh
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#5C4DB1",
    borderRadius: 8,
    padding: 12,
    minWidth: 120,
    alignItems: "center",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  noDataText: {
    flex: 4,
    textAlign: "center",
    color: "#999",
  },
});

export default LiveGameScreen;
